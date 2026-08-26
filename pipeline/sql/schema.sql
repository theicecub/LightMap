-- LightMap pipeline — схема Neon Postgres (free tier).
-- Храним: кандидатов из Overpass, кэш bbox-запросов, кэш дорог (для ориентации),
-- фото Mapillary (+ навсегда base64 выбранного превью и атрибуцию),
-- классификации Groq, очередь на проверку и лог прогонов.
--
-- Статусная машина candidates.status:
--   new        — загружен из Overpass, ждёт фото
--   no_photo   — нет покрытия Mapillary (пропуск, ведётся счётчиком в runs)
--   photo_ok   — фото выбрано, ждёт классификации
--   classified — есть классификация Groq
--   ready      — высокая уверенность, готов к публикации
--   queued     — низкая уверенность, в review_queue
--   approved   — одобрен ревьюером (из review_queue)
--   rejected   — не отражает / не стекло / отклонён вручную
--   published  — добавлен в buildings.json (published_building_id = id в JSON)

CREATE TABLE IF NOT EXISTS candidates (
  id            SERIAL PRIMARY KEY,
  osm_type      TEXT NOT NULL CHECK (osm_type IN ('way', 'relation')),
  osm_id        BIGINT NOT NULL,
  district      TEXT NOT NULL,                    -- метка bbox: 'almaty', 'saryarka', ...
  name_ru       TEXT,
  name_en       TEXT,
  building      TEXT,                             -- значение тега building
  levels        REAL,                             -- building:levels (или height/3.3)
  height        REAL,                             -- building:height, м
  lat           DOUBLE PRECISION NOT NULL,        -- центроид
  lng           DOUBLE PRECISION NOT NULL,
  geometry      JSONB NOT NULL,                   -- полигон [[lat,lng],...] из Overpass
  tags          JSONB NOT NULL,                   -- все теги OSM как есть
  address_ru    TEXT,                             -- заполняется на шаге 04 из addr:*
  address_en    TEXT,
  orientation   INT CHECK (orientation BETWEEN 0 AND 360),
  -- ВАЖНО: 0 в buildings.json означает «ориентация неизвестна» (route.js).
  -- Поэтому «нормаль на север» хранится и публикуется как 360.
  orientation_source TEXT,                        -- напр. 'road:way/123456'
  base_lux      INT,
  period        TEXT,                             -- morning | evening | both
  danger_time   TEXT,                             -- «07:30–09:30 17:30–20:00»
  status        TEXT NOT NULL DEFAULT 'new',
  published_building_id INT,                      -- id, присвоенный в buildings.json
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (osm_type, osm_id)
);

CREATE INDEX IF NOT EXISTS candidates_status_idx ON candidates (status);
CREATE INDEX IF NOT EXISTS candidates_district_idx ON candidates (district);

-- Отметка «дороги для ориентации уже загружены» — чтобы повторный прогон 01-кандидатов
-- добирал дороги только для тех, у кого их нет (bbox-кэш свежий, здания не перезапрашиваются).
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS roads_fetched BOOLEAN NOT NULL DEFAULT false;

-- Кэш Overpass-запросов по bbox: один и тот же район не дёргаем повторно,
-- пока кэш свежий (TTL задаётся в config.js, по умолчанию 7 дней).
CREATE TABLE IF NOT EXISTS bbox_cache (
  label         TEXT PRIMARY KEY,                 -- 'almaty', 'saryarka'
  min_lat       DOUBLE PRECISION NOT NULL,
  min_lng       DOUBLE PRECISION NOT NULL,
  max_lat       DOUBLE PRECISION NOT NULL,
  max_lng       DOUBLE PRECISION NOT NULL,
  element_count INT NOT NULL DEFAULT 0,
  query_md5     TEXT,
  fetched_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Дороги OSM около кандидатов — для вычисления ориентации фасада.
-- Дедуп по osm_id: одна дорога обслуживает все здания рядом.
CREATE TABLE IF NOT EXISTS roads_cache (
  osm_id        BIGINT PRIMARY KEY,
  highway       TEXT NOT NULL,
  name_ru       TEXT,
  geometry      JSONB NOT NULL,                   -- [[lat,lng],...] полилиния
  fetched_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Фото Mapillary (лицензия CC BY-SA 4.0, attribution обязателен).
-- image_base64 — байты thumb_1024_url, «навсегда»: Neon переживает
-- удаление снимка с Mapillary. Хранится только для выбранного фото.
CREATE TABLE IF NOT EXISTS photos (
  id                  SERIAL PRIMARY KEY,
  candidate_id        INT NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  mapillary_image_id  BIGINT NOT NULL,
  thumb_url           TEXT NOT NULL,              -- thumb_1024_url (публичный CDN)
  image_base64        TEXT,                       -- байты превью (только selected)
  owner               TEXT,
  attribution         TEXT NOT NULL,              -- '© <owner> / Mapillary, CC BY-SA 4.0'
  captured_at         BIGINT,                     -- epoch ms
  compass_angle       REAL,                       -- куда смотрела камера, ° от севера
  camera_lat          DOUBLE PRECISION,
  camera_lng          DOUBLE PRECISION,
  distance_m          REAL,                       -- до центроида здания
  view_match          REAL,                       -- 0..1, насколько камера смотрит на здание
  is_pano             BOOLEAN NOT NULL DEFAULT false,
  selected            BOOLEAN NOT NULL DEFAULT false,
  fetched_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (candidate_id, mapillary_image_id)
);

CREATE INDEX IF NOT EXISTS photos_candidate_selected_idx ON photos (candidate_id) WHERE selected;

-- Классификация фасада (Groq, qwen vision, structured output).
CREATE TABLE IF NOT EXISTS classifications (
  id                SERIAL PRIMARY KEY,
  candidate_id      INT NOT NULL UNIQUE REFERENCES candidates(id) ON DELETE CASCADE,
  photo_id          INT REFERENCES photos(id),
  model             TEXT NOT NULL,                -- напр. 'qwen/qwen3.6-27b'
  is_reflective     BOOLEAN NOT NULL,
  glass_category    TEXT NOT NULL CHECK (glass_category IN (
                      'mirror', 'high_selective', 'low_e_panoramic',
                      'tinted', 'laminated', 'curtain_wall', 'not_glass')),
  glazing_coverage  REAL NOT NULL CHECK (glazing_coverage BETWEEN 0 AND 1),
  confidence        REAL NOT NULL CHECK (confidence BETWEEN 0 AND 1),
  raw_response      JSONB,                        -- как ответила модель (для отладки)
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Очередь на ручную проверку: confidence ниже порога (или ручной отбор).
CREATE TABLE IF NOT EXISTS review_queue (
  candidate_id  INT PRIMARY KEY REFERENCES candidates(id) ON DELETE CASCADE,
  reason        TEXT NOT NULL,                    -- 'low_confidence', 'borderline'
  confidence    REAL NOT NULL,
  suggested     JSONB NOT NULL,                   -- полная черновая запись buildings.json
  decision      TEXT CHECK (decision IN ('approved', 'rejected')),
  note          TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  decided_at    TIMESTAMPTZ
);

-- Лог прогонов: счётчики «нет фото», батчей, лимитов — видеть масштаб пропусков.
CREATE TABLE IF NOT EXISTS runs (
  id          SERIAL PRIMARY KEY,
  step        TEXT NOT NULL,                      -- '01-candidates', ...
  ok          BOOLEAN NOT NULL DEFAULT true,
  stats       JSONB NOT NULL DEFAULT '{}',        -- {no_photo: 12, processed: 30, ...}
  started_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  finished_at TIMESTAMPTZ
);
