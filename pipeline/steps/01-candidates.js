// Шаг 1. Кандидаты из Overpass (бесплатно, без ИИ): здания ≥ 6 этажей офисного/
// коммерческого/гостиничного типа в bbox районов. Кэш bbox → не дёргать повторно.
// Заодно подтягиваем дороги OSM около новых кандидатов (для шага 4 — ориентация).
//
//   node steps/01-candidates.js [--refresh] [--district almaty]

import { db, ensureSchema } from '../lib/db.js';
import { runStep, loadBuildingsJson } from '../lib/runner.js';
import { fetchOverpass, buildBuildingsQuery, buildRoadsAroundQuery, ROAD_CLASSES } from '../lib/overpass.js';
import { haversineMeters, centroidOfPolygon } from '../lib/geometry.js';
import {
  DISTRICTS, OVERPASS_BBOX_TTL_DAYS, MIN_LEVELS, LEVELS_FROM_HEIGHT_M,
  BUILDING_TYPES, DEDUPE_RADIUS_M, ROAD_FETCH_BATCH,
} from '../config.js';
import { requireEnv } from '../config.js';
import crypto from 'node:crypto';

const args = process.argv.slice(2);
const REFRESH = args.includes('--refresh');
const ONLY = (args.find((a) => a.startsWith('--district=')) || '').split('=')[1];

function parseLevels(el) {
  const lv = parseFloat(el.tags?.['building:levels']);
  if (Number.isFinite(lv)) return lv;
  const h = parseFloat(el.tags?.['height']);
  if (Number.isFinite(h)) return h / LEVELS_FROM_HEIGHT_M;
  return null;
}

function geometryToPolygon(el) {
  // out tags geom даёт geometry: [{lat,lng},…] (замкнут для ways-полигонов)
  if (!Array.isArray(el.geometry) || el.geometry.length < 4) return null;
  const poly = el.geometry.map((g) => [g.lat, g.lng]);
  const first = poly[0], last = poly[poly.length - 1];
  if (first[0] !== last[0] || first[1] !== last[1]) poly.push(first);
  return poly;
}

async function main() {
  requireEnv();
  const sql = db();
  await ensureSchema(sql);
  const published = loadBuildingsJson();

  await runStep(sql, '01-candidates', async (count) => {
    for (const d of Object.values(DISTRICTS)) {
      if (!d.enabled) continue;
      if (ONLY && d.label !== ONLY) continue;
      const [S, W, N, E] = d.bbox;

      // Свежесть кэша bbox: повторный Overpass-запрос не чаще TTL.
      const cached = await sql`SELECT fetched_at FROM bbox_cache WHERE label = ${d.label}`;
      const fresh = cached.length &&
        Date.now() - new Date(cached[0].fetched_at) < OVERPASS_BBOX_TTL_DAYS * 86400000;
      if (fresh && !REFRESH) {
        count(`bbox_cache_hit:${d.label}`);
        continue;
      }

      const query = buildBuildingsQuery(d.bbox, BUILDING_TYPES, MIN_LEVELS);
      const elements = await fetchOverpass(query, { label: `buildings:${d.label}` });
      count(`overpass_elements:${d.label}`, elements.length);

      let inserted = 0;
      const newPoints = [];
      for (const el of elements) {
        if (el.type !== 'way') continue;
        const levels = parseLevels(el);
        if (levels == null || levels < MIN_LEVELS) continue;
        const polygon = geometryToPolygon(el);
        if (!polygon) continue;

        const c = centroidOfPolygon(polygon);
        // Дедуп против опубликованных 29 (по расстоянию) и уже вставленных.
        const nearPublished = published.some(
          (b) => haversineMeters(b.lat, b.lng, c.lat, c.lng) < DEDUPE_RADIUS_M);
        const exists = await sql`SELECT id FROM candidates WHERE osm_type = 'way' AND osm_id = ${el.id}`;
        if (nearPublished || exists.length) { count('duplicates_skipped'); continue; }

        const nameRu = el.tags?.['name:ru'] || el.tags?.name || null;
        await sql`
          INSERT INTO candidates (osm_type, osm_id, district, name_ru, name_en, building,
                                  levels, height, lat, lng, geometry, tags)
          VALUES ('way', ${el.id}, ${d.label}, ${nameRu}, ${el.tags?.['name:en'] || null},
                  ${el.tags?.building || null}, ${levels},
                  ${parseFloat(el.tags?.height) || null}, ${c.lat}, ${c.lng},
                  ${JSON.stringify(polygon)}::jsonb, ${JSON.stringify(el.tags || {})}::jsonb)
          ON CONFLICT (osm_type, osm_id) DO NOTHING`;
        inserted++;
        newPoints.push({ id: el.id, lat: c.lat, lng: c.lng });
        count('inserted');
      }

      await sql`
        INSERT INTO bbox_cache (label, min_lat, min_lng, max_lat, max_lng, element_count, query_md5, fetched_at)
        VALUES (${d.label}, ${S}, ${W}, ${N}, ${E}, ${elements.length},
                ${crypto.createHash('md5').update(query).digest('hex')}, now())
        ON CONFLICT (label) DO UPDATE SET element_count = EXCLUDED.element_count,
          query_md5 = EXCLUDED.query_md5, fetched_at = now()`;

      // Дороги вокруг новых кандидатов — пачками по ROAD_FETCH_BATCH за один запрос.
      for (let i = 0; i < newPoints.length; i += ROAD_FETCH_BATCH) {
        const batch = newPoints.slice(i, i + ROAD_FETCH_BATCH);
        const roads = await fetchOverpass(buildRoadsAroundQuery(batch), { label: `roads:${d.label}` });
        for (const r of roads) {
          if (r.type !== 'way' || !ROAD_CLASSES.has(r.tags?.highway)) continue;
          const line = (r.geometry || []).map((g) => [g.lat, g.lng]);
          if (line.length < 2) continue;
          await sql`
            INSERT INTO roads_cache (osm_id, highway, name_ru, geometry)
            VALUES (${r.id}, ${r.tags.highway}, ${r.tags?.['name:ru'] || r.tags?.name || null},
                    ${JSON.stringify(line)}::jsonb)
            ON CONFLICT (osm_id) DO NOTHING`;
          count('roads_cached');
        }
      }
      console.log(`[${d.label}] вставлено кандидатов: ${inserted}`);
    }
  });
}

main().catch((e) => { console.error(e); process.exit(1); });
