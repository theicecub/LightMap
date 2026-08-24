# LightMap pipeline — поиск новых зданий-кандидатов

Полностью бесплатный полуавтоматический пайплайн: находит высотные здания Астаны
за пределами текущих 29 (в первую очередь Алматинский и Сарыаркинский районы),
проверяет по фото Mapillary, стеклянный ли фасад (единственный ИИ-шаг — Groq free
tier), и генерирует записи в формате `buildings.json`. Ни одного платного API:
**Overpass + Mapillary + Groq free tier + Neon free tier**.

Формула риска (`period`/`dangerTime`/recalcDanger в `script.js`/`route.js`)
**не меняется** — пайплайн только добавляет записи в `buildings.json`, который
остаётся финальным опубликованным списком, как сейчас.

## Схема работы

```
Overpass (bbox районов)          Mapillary (CC BY-SA 4.0)     Groq (qwen vision)
      │  здания ≥6 этажей,            │  фото фасада по           │  is_reflective,
      │  геометрия+теги → Neon         │  ракурсу → Neon           │  glass_category,
      ▼                                ▼                          ▼  coverage, confidence
 01-candidates ──────────────▶ 02-photos ──────────────▶ 03-classify
      │ дороги OSM → roads_cache   │ нет фото →                │
      │ (для ориентации)           │ status=no_photo + счётчик  ▼
      │                            │ (не публикуется)     04-finalize (без ИИ)
      │                                                  │ ориентация: нормаль ребра
      │                                                  │   полигона к ближайшей дороге
      │                                                  │ baseLux: K(кат.)×L(этажи)×C(остекл.)
      │                                                  │ period/dangerTime: солнце Астаны
      │                                                  ▼
      │                    conf ≥ 0.65 ──▶ status=ready ──┐
      │                    conf < 0.65 ──▶ review_queue   │ ручная проверка
      ▼                                                   ▼
                                              05-publish --publish
                                              → дописывает buildings.json
                                                (бэкап + последовательные id)
```

## Настройка (один раз)

1. **Neon** (бесплатный тариф: 0.5 ГБ, 100 compute-ч/мес, scale-to-zero):
   [console.neon.tech](https://console.neon.tech) → Create project → скопировать
   Connection string в `DATABASE_URL`. Схема создаётся автоматически при первом
   запуске любого шага (`ensureSchema` из `sql/schema.sql`).

2. **Mapillary**: [mapillary.com](https://mapillary.com) → Developers →
   Create token → User Access Token в `MAPILLARY_ACCESS_TOKEN`.

3. **Groq**: [console.groq.com](https://console.groq.com) → API Keys → ключ без
   карты в `GROQ_API_KEY`. Vision-модель настраивается переменной
   `GROQ_VISION_MODEL` (по умолчанию `qwen/qwen3.6-27b` — проверяй актуальность
   на console.groq.com/docs/models, Groq депрекейтит preview-модели).

```bash
cd pipeline
npm install
cp .env.example .env   # и вписать три ключа
```

## Запуск (по чуть-чуть за прогон)

Все команды — из `pipeline/`, с `--env-file` (Node ≥ 20.6):

```bash
node --env-file=.env steps/01-candidates.js            # Overpass: кандидаты + дороги
node --env-file=.env steps/02-photos.js [--limit=40]   # Mapillary: фото / no_photo
node --env-file=.env steps/03-classify.js [--limit=20] # Groq: батч ≤20, ~15 RPM
node --env-file=.env steps/04-finalize.js              # ориентация, baseLux, окна
node --env-file=.env steps/05-publish.js --stats       # счётчики и очередь
node --env-file=.env steps/05-publish.js --list        # что готово к публикации
node --env-file=.env steps/05-publish.js --show <id>   # детали кандидата
node --env-file=.env steps/05-publish.js --approve <id>   # одобрить из очереди
node --env-file=.env steps/05-publish.js --reject <id>    # отклонить
node --env-file=.env steps/05-publish.js --publish      # дописать buildings.json
```

Шаги идемпотентны: статусная машина в `candidates.status`
(`new → photo_ok → classified → ready|queued → approved → published`,
плюс `no_photo`/`rejected`) позволяет гонять их в любом темпе. Повторный прогон
01 по тому же bbox не дёргает Overpass чаще раза в 7 дней (TTL в `bbox_cache`,
обойти — `--refresh`).

## Лимиты бесплатных API и как они соблюдены

| API      | Лимит                                      | Что делает пайплайн |
|----------|--------------------------------------------|---------------------|
| Overpass | 2 слота, ~10k запросов/день                | 1 запрос на bbox (TTL 7 дней) + пачки `around` для дорог (40 зданий/запрос), пауза 3 с, 4 зеркала с фолбэком |
| Mapillary | публичных хард-лимитов нет             | 1 маленький bbox на здание, пауза 250 мс |
| Groq     | free tier, у preview-моделей RPM/TPM ниже | батч ≤ 20 за прогон, интервал 4 с (~15 RPM), backoff по `Retry-After` |
| Neon     | 100 compute-ч/мес                          | HTTP-драйвер, короткие сессии; фото хранятся как base64-превью только выбранные (следи за 0.5 ГБ: ~250 КБ/фото, отключается `STORE_IMAGE_DATA=false`) |

## Детали реализации

- **Ориентация (без ИИ).** Для каждого ребра полигона здания ищем ближайшую
  точку дороги; берём ребро с наименьшей дистанцией (с бонусом крупным дорогам:
  motorway×6 … service×1), при условии что наружная нормаль ребра смотрит на
  дорогу (±75°). Ориентация = азимут нормали. **«Север» хранится как 360**, т.к.
  в `route.js`/`script.js` значение `0` означает «ориентация неизвестна».
- **baseLux (калибровка).** `baseLux = K(категория) × (levels/10)^0.35 ×
  (0.55 + 0.45×coverage)`, кламп 5k–95k, округление до сотен. K = медиана по 29
  зданиям `buildings.json` с реальной этажностью из OSM
  (`calibrate.js --fetch`, кэш в `calibration-levels.json`):
  mirror 70000, high_selective 91800, low_e_panoramic 40000, tinted 19800,
  laminated 47700, curtain_wall 50000. Средняя ошибка на эталоне ~26% — для
  категорий с 1–2 примерами это предел; перекалибруй после ручных проверок.
- **period/dangerTime (новые записи).** Генерируются из той же солнечной
  геометрии, что и рантайм `script.js` (порт `getSunPosition` без изменений):
  опасно, когда высота солнца 5–50° и азимут в ±60° от ориентации фасада.
  Медианные границы окон за год, местное время UTC+5.
- **Порог доверия.** `confidence < 0.65` → `review_queue` (не публикуется).
  Смотри кандидаты через `--show`, одобряй `--approve`.
- **Дедупликация.** По OSM id и по близости <40 м к текущим 29 зданиям.
- **«Нет фото».** `status=no_photo`, суммарный счётчик виден в
  `05-publish --stats` — реальный масштаб непокрытых Mapillary районов.

## Атрибуция Mapillary (обязательно, CC BY-SA 4.0)

Атрибуция каждого снимка хранится в `photos.attribution`. Рекомендуется
добавить на сайт (например, в футер `index.html`):

```
© Mapillary contributors, CC BY-SA 4.0
```

## Таблицы Neon

- `candidates` — кандидаты + производные поля (ориентация, baseLux, адрес,
  статусы, `published_building_id`);
- `bbox_cache` — TTL кэш Overpass-запросов по районам;
- `roads_cache` — дороги OSM около кандидатов (для ориентации), дедуп по osm_id;
- `photos` — снимки Mapillary: метаданные, атрибуция, base64 выбранного
  превью («навсегда»), ракурсные оценки;
- `classifications` — результат Groq (модель, категория, coverage, confidence,
  сырой ответ);
- `review_queue` — записи на ручную проверку + решения;
- `runs` — лог прогонов со счётчиками (в т.ч. `no_photo`).

## Где что настраивается

Всё в `pipeline/config.js`: bbox районов (`DISTRICTS` — приблизительные,
уточняй на bboxfinder.com), минимальная этажность, типы зданий, радиус и критерии
выбора фото, интервалы rate-limit, размер батчей, порог confidence, модель Groq.
