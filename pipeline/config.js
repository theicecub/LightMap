// Конфигурация пайплайна. Всё бесплатное: Overpass, Mapillary, Groq free tier, Neon free tier.

export const OVERPASS_ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://overpass.private.coffee/api/interpreter',
  'https://maps.mail.ru/osm/tools/overpass/api/interpreter',
];

export const OVERPASS_TIMEOUT_S = 180;
export const OVERPASS_BBOX_TTL_DAYS = 7;      // не дёргать один bbox чаще раза в неделю

// Bounding box'ы районов (S, W, N, E). Приблизительные — уточнить на bboxfinder.com.
// 'esil' выключен: текущие 29 зданий уже покрывают его вручную; bbox нужен только
// чтобы дедуп не пропустил здания на границах районов — дедуп идёт по координатам.
export const DISTRICTS = {
  almaty:   { label: 'almaty',   bbox: [51.060, 71.330, 51.170, 71.530], enabled: true },
  saryarka: { label: 'saryarka', bbox: [51.130, 71.330, 51.270, 71.520], enabled: true },
};

// ── Этап 1: кандидаты ─────────────────────────────────────────────────────────
export const MIN_LEVELS = 6;                   // > 5–6 этажей
export const LEVELS_FROM_HEIGHT_M = 3.3;       // этаж ≈ 3.3 м, если levels нет
export const BUILDING_TYPES = [
  'office', 'commercial', 'retail', 'hotel', 'apartments', 'dormitory',
  'mixed_use', 'civic', 'public', 'hospital', 'university', 'train_station', 'yes',
];
export const DEDUPE_RADIUS_M = 40;             // ближе к существующему зданию — дубликат

// ── Этап 2: Mapillary ────────────────────────────────────────────────────────
export const MAPILLARY_GRAPH = 'https://graph.mapillary.com';
export const MAPILLARY_SEARCH_RADIUS_M = 100;  // bbox вокруг центроида здания
export const PHOTO_MIN_DIST_M = 8;             // ближе — съёмка вплотную, фасада не видно
export const PHOTO_MAX_DIST_M = 70;
export const PHOTO_VIEW_TOLERANCE_DEG = 70;    // камера должна смотреть на здание ±70°
export const STORE_IMAGE_DATA = true;          // хранить base64 превью в Neon «навсегда»

// ── Этап 3: Groq ─────────────────────────────────────────────────────────────
export const GROQ_API = 'https://api.groq.com/openai/v1';
// Актуальную vision-модель проверять: https://console.groq.com/docs/models
// (авг. 2026: qwen/qwen3.6-27b — единственная multimodal; preview, лимиты 250K TPM / 1K RPM)
export const GROQ_MODEL = process.env.GROQ_VISION_MODEL || 'qwen/qwen3.6-27b';
export const GROQ_MIN_INTERVAL_MS = 4000;      // ~15 RPM — с запасом под free tier
export const GROQ_MAX_IMAGES_PER_RUN = 20;     // маленькие батчи, легко проверять глазами

// ── Этап 4: пороги и формула ────────────────────────────────────────────────
export const CONFIDENCE_THRESHOLD = 0.65;      // ниже — в review_queue, не публиковать

// ── Этап 7: батчи и лимиты ──────────────────────────────────────────────────
export const MAX_CANDIDATES_PER_RUN = 200;     // Overpass (один запрос на bbox, не на здание)
export const MAX_PHOTOS_PER_RUN = 40;          // Mapillary (по одному маленькому bbox на здание)
export const MAPILLARY_MIN_INTERVAL_MS = 250;
export const ROAD_FETCH_BATCH = 40;            // кандидатов на один Overpass-запрос дорог
export const ROAD_AROUND_M = 100;              // дороги в радиусе N м от центроида

export const NEON_DATABASE_URL = process.env.DATABASE_URL;
export const MAPILLARY_TOKEN = process.env.MAPILLARY_ACCESS_TOKEN;
export const GROQ_API_KEY = process.env.GROQ_API_KEY;

export function requireEnv() {
  const missing = [
    ['DATABASE_URL', NEON_DATABASE_URL],
    ['MAPILLARY_ACCESS_TOKEN', MAPILLARY_TOKEN],
    ['GROQ_API_KEY', GROQ_API_KEY],
  ].filter(([, v]) => !v).map(([k]) => k);
  if (missing.length) {
    throw new Error(`Не заданы переменные окружения: ${missing.join(', ')}. См. pipeline/.env.example`);
  }
}
