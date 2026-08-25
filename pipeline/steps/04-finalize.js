// Шаг 4. Финализация (всё без ИИ): ориентация по геометрии+дорогам, адрес из OSM,
// baseLux по калиброванной формуле, period/dangerTime по солнечной геометрии Астаны.
// confidence ≥ порога → status='ready'; ниже → review_queue (не публикуется).
// Не отражает / не стекло → status='rejected'.
//
//   node steps/04-finalize.js [--limit N]

import { db, ensureSchema } from '../lib/db.js';
import { runStep } from '../lib/runner.js';
import { orientationFromRoads, haversineMeters } from '../lib/geometry.js';
import { dangerWindowsForOrientation } from '../lib/sun.js';
import { computeBaseLux } from '../lib/baselux.js';
import { GLASS_CATEGORIES } from '../lib/categories.js';
import { translit, ruAddressToEn } from '../lib/translit.js';
import { requireEnv, CONFIDENCE_THRESHOLD } from '../config.js';

const args = process.argv.slice(2);
const LIMIT = Number((args.find((a) => a.startsWith('--limit=')) || '').split('=')[1]) || 100;

function addressFromTags(tags, fallbackRoadName) {
  const street = tags?.['addr:street'] || tags?.['addr:street:ru'] || fallbackStreet(fallbackRoadName);
  const num = tags?.['addr:housenumber'];
  if (street && num) return `${street}, ${num}`;
  if (street) return street;
  return null;
}
function fallbackStreet(roadName) {
  return roadName ? `ул. ${roadName}` : null;
}

async function main() {
  requireEnv();
  const sql = db();
  await ensureSchema(sql);

  await runStep(sql, '04-finalize', async (count) => {
    const rows = await sql`
      SELECT c.*, cl.is_reflective, cl.glass_category, cl.glazing_coverage, cl.confidence
      FROM candidates c JOIN classifications cl ON cl.candidate_id = c.id
      WHERE c.status = 'classified' ORDER BY c.id LIMIT ${LIMIT}`;
    console.log(`к финализации: ${rows.length}`);

    // Дороги грузим один раз; для каждого кандидата фильтруем по ~250м от центроида.
    const allRoads = await sql`SELECT osm_id, highway, name_ru, geometry FROM roads_cache`;

    for (const c of rows) {
      const polygon = c.geometry;

      const nearby = [];
      const highways = [];
      let nearestRoad = null;
      let nearestDist = Infinity;
      for (const r of allRoads) {
        const d = Math.min(...r.geometry.map(([la, ln]) => haversineMeters(la, ln, c.lat, c.lng)));
        if (d < 250) { nearby.push(r.geometry); highways.push(r.highway); }
        if (d < nearestDist) { nearestDist = d; nearestRoad = r; }
      }
      const orientation = orientationFromRoads(polygon, nearby, highways) ?? 0;

      const addressRu = addressFromTags(c.tags, nearestRoad?.name_ru);
      const addressEn = addressRu ? ruAddressToEn(addressRu) : null;
      const nameRu = c.name_ru || (addressRu ? `Здание (${addressRu})` : `ОСМ way/${c.osm_id}`);
      const nameEn = c.name_en || c.tags?.['name:en'] || translit(nameRu);

      const baseLux = computeBaseLux(c.glass_category, c.levels, c.glazing_coverage);
      const { period, dangerTime } = dangerWindowsForOrientation(orientation, c.lat, c.lng);

      const suggested = {
        name: nameRu, address: addressRu || '—',
        lat: c.lat, lng: c.lng, baseLux,
        glass: GLASS_CATEGORIES[c.glass_category].ru,
        glass_en: GLASS_CATEGORIES[c.glass_category].en,
        orientation, period, dangerTime,
        name_en: nameEn, address_en: addressEn || '—',
      };

      if (!c.is_reflective || c.glass_category === 'not_glass') {
        await sql`UPDATE candidates SET status = 'rejected', updated_at = now() WHERE id = ${c.id}`;
        count('rejected');
        continue;
      }

      if (c.confidence >= CONFIDENCE_THRESHOLD) {
        await sql`
          UPDATE candidates SET orientation = ${orientation},
            orientation_source = ${nearestRoad ? `road:way/${nearestRoad.osm_id}` : null},
            base_lux = ${baseLux}, name_ru = ${nameRu}, name_en = ${nameEn},
            address_ru = ${addressRu}, address_en = ${addressEn},
            period = ${period}, danger_time = ${dangerTime},
            status = 'ready', updated_at = now()
          WHERE id = ${c.id}`;
        count('ready');
        console.log(`  #${c.id} READY ${nameRu}: orient=${orientation}°, ${baseLux} lx, conf=${c.confidence}`);
      } else {
        await sql`
          UPDATE candidates SET orientation = ${orientation},
            orientation_source = ${nearestRoad ? `road:way/${nearestRoad.osm_id}` : null},
            base_lux = ${baseLux}, name_ru = ${nameRu}, name_en = ${nameEn},
            address_ru = ${addressRu}, address_en = ${addressEn},
            period = ${period}, danger_time = ${dangerTime},
            status = 'queued', updated_at = now()
          WHERE id = ${c.id}`;
        await sql`
          INSERT INTO review_queue (candidate_id, reason, confidence, suggested)
          VALUES (${c.id}, 'low_confidence', ${c.confidence}, ${JSON.stringify(suggested)}::jsonb)
          ON CONFLICT (candidate_id) DO UPDATE SET confidence = EXCLUDED.confidence,
            suggested = EXCLUDED.suggested, decision = NULL, decided_at = NULL`;
        count('queued_for_review');
        console.log(`  #${c.id} В ОЧЕРЕДЬ ${nameRu}: conf=${c.confidence} < ${CONFIDENCE_THRESHOLD}`);
      }
    }
  });
}

main().catch((e) => { console.error(e); process.exit(1); });
