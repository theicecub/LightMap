// Шаг 2. Фото фасада — ТОЛЬКО Mapillary (CC BY-SA 4.0). Нет покрытия →
// status='no_photo' (счётчик пропусков в runs.stats), здание не классифицируется.
// Превью выбранного фото сохраняется в Neon навсегда (base64 + атрибуция).
//
//   node steps/02-photos.js [--limit N]

import { db, ensureSchema } from '../lib/db.js';
import { runStep } from '../lib/runner.js';
import { fetchImagesAround, bestPhoto, downloadThumb, attributionFor } from '../lib/mapillary.js';
import { sleep } from '../lib/http.js';
import {
  requireEnv, MAPILLARY_TOKEN, MAX_PHOTOS_PER_RUN, MAPILLARY_MIN_INTERVAL_MS,
  MAPILLARY_SEARCH_RADIUS_M, PHOTO_MIN_DIST_M, PHOTO_MAX_DIST_M,
  PHOTO_VIEW_TOLERANCE_DEG, STORE_IMAGE_DATA,
} from '../config.js';

const args = process.argv.slice(2);
const LIMIT = Number((args.find((a) => a.startsWith('--limit=')) || '').split('=')[1]) || MAX_PHOTOS_PER_RUN;

async function main() {
  requireEnv();
  const sql = db();
  await ensureSchema(sql);

  await runStep(sql, '02-photos', async (count) => {
    const rows = await sql`
      SELECT id, lat, lng, name_ru FROM candidates WHERE status = 'new' ORDER BY id LIMIT ${LIMIT}`;
    console.log(`кандидатов на обработку: ${rows.length}`);

    for (const c of rows) {
      const images = await fetchImagesAround(MAPILLARY_TOKEN, c, MAPILLARY_SEARCH_RADIUS_M);
      await sleep(MAPILLARY_MIN_INTERVAL_MS);
      count('mapillary_queries');

      const center = { lat: c.lat, lng: c.lng };
      const shot = bestPhoto(images, center, {
        minDist: PHOTO_MIN_DIST_M, maxDist: PHOTO_MAX_DIST_M,
        viewToleranceDeg: PHOTO_VIEW_TOLERANCE_DEG,
      });

      if (!shot) {
        await sql`UPDATE candidates SET status = 'no_photo', updated_at = now() WHERE id = ${c.id}`;
        count('no_photo');
        continue;
      }

      // Сохраняем все подходящие кадры как кэш, лучший — с base64.
      let base64 = null;
      if (STORE_IMAGE_DATA) {
        const dl = await downloadThumb(shot.image.thumb_1024_url);
        base64 = dl.base64;
        count('photo_bytes_stored', dl.bytes);
      }
      await sql`
        INSERT INTO photos (candidate_id, mapillary_image_id, thumb_url, image_base64, owner,
                            attribution, captured_at, compass_angle, camera_lat, camera_lng,
                            distance_m, view_match, is_pano, selected)
        VALUES (${c.id}, ${shot.image.id}, ${shot.image.thumb_1024_url}, ${base64},
                ${shot.image.owner?.username || null}, ${attributionFor(shot.image)},
                ${shot.image.captured_at || null}, ${shot.image.compass_angle},
                ${shot.cameraLat}, ${shot.cameraLng}, ${shot.distanceM}, ${shot.viewMatch},
                ${Boolean(shot.image.is_pano)}, true)
        ON CONFLICT (candidate_id, mapillary_image_id) DO NOTHING`;

      for (const img of images.slice(0, 10)) { // кэш остальных кадров без байтов
        if (img.id === shot.image.id || !img.thumb_1024_url) continue; // thumb_url NOT NULL
        await sql`
          INSERT INTO photos (candidate_id, mapillary_image_id, thumb_url, image_base64, owner,
                              attribution, captured_at, compass_angle, camera_lat, camera_lng,
                              distance_m, view_match, is_pano, selected)
          VALUES (${c.id}, ${img.id}, ${img.thumb_1024_url || null}, null,
                  ${img.owner?.username || null}, ${attributionFor(img)},
                  ${img.captured_at || null}, ${img.compass_angle || null},
                  ${img.computed_geometry?.lat || null}, ${img.computed_geometry?.lng || null},
                  null, null, ${Boolean(img.is_pano)}, false)
          ON CONFLICT (candidate_id, mapillary_image_id) DO NOTHING`;
        count('photos_cached');
      }

      await sql`UPDATE candidates SET status = 'photo_ok', updated_at = now() WHERE id = ${c.id}`;
      count('photo_ok');
      console.log(`  #${c.id} ${c.name_ru || ''} — фото ${shot.image.id} (${Math.round(shot.distanceM)}м, ракурс ${Math.round(shot.viewMatch * 100)}%)`);
    }
    // Реальный масштаб непокрытых кандидатов — видно в каждом прогоне runs.stats.
    const totals = await sql`SELECT status, count(*)::int AS n FROM candidates GROUP BY status`;
    console.log('статусы:', totals.map((t) => `${t.status}=${t.n}`).join(' '));
  });
}

main().catch((e) => { console.error(e); process.exit(1); });
