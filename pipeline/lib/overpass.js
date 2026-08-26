// Overpass API (бесплатный, без ключей). Один запрос на bbox — кэшируется в bbox_cache.
// Числовой фильтр building:levels Overpass не умеет — фильтруем на клиенте.

import { OVERPASS_ENDPOINTS, OVERPASS_TIMEOUT_S, OVERPASS_PAUSE_MS, ROAD_AROUND_M } from '../config.js';
import { fetchWithRetry, sleep } from './http.js';

const [S, W, N, E] = [0, 1, 2, 3];
export const bboxStr = (b) => `${b[S]},${b[W]},${b[N]},${b[E]}`;

export function buildBuildingsQuery(bbox, types, minLevels) {
  const b = bboxStr(bbox);
  const typesRe = `^(${types.join('|')})$`;
  return `[out:json][timeout:${OVERPASS_TIMEOUT_S}];
(
  way["building"~"${typesRe}"]["building:levels"](${b});
  way["building"~"${typesRe}"]["height"](${b});
  way["building"="yes"]["building:levels"](${b});
);
out tags geom;`;
}

// Дороги вокруг пачки кандидатов одним запросом: way(around:R,lat,lng)[highway]
// UNION всех around-фильтров; ассоциация зданию не нужна — ищем ближайшую на клиенте.
export function buildRoadsAroundQuery(points, radiusM = ROAD_AROUND_M) {
  const filters = points
    .map((p) => `way(around:${radiusM},${p.lat.toFixed(6)},${p.lng.toFixed(6)})["highway"];`)
    .join('\n  ');
  return `[out:json][timeout:${OVERPASS_TIMEOUT_S}];
(
  ${filters}
);
out tags geom;`;
}

const ROAD_CLASSES = new Set([
  'motorway', 'trunk', 'primary', 'secondary', 'tertiary',
  'unclassified', 'residential', 'living_street',
  'motorway_link', 'trunk_link', 'primary_link', 'secondary_link', 'tertiary_link',
  'service',
]);

export async function fetchOverpass(query, { label = 'overpass' } = {}) {
  let lastErr;
  for (const endpoint of OVERPASS_ENDPOINTS) {
    try {
      const body = new URLSearchParams({ data: query });
      const resp = await fetchWithRetry(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json',
          'User-Agent': 'LightMap-pipeline/1.0 (github.com/theicecub/LightMap)',
        },
        body: body.toString(),
      }, { retries: 3, label });
      const json = await resp.json();
      if (!json.elements) throw new Error('нет поля elements в ответе Overpass');
      // Вежливость к общественным инстансам: пауза между запросами.
      await sleep(OVERPASS_PAUSE_MS);
      console.log(`[overpass] ${new URL(endpoint).host}: ${json.elements.length} элементов`);
      return json.elements;
    } catch (err) {
      lastErr = err;
      console.warn(`[overpass] ${endpoint} не ответил: ${err.message}`);
    }
  }
  throw lastErr;
}

export { ROAD_CLASSES };
