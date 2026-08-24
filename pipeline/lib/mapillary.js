// Mapillary Graph API (бесплатно, токен клиента из mapillary.com → Developers).
// Лицензия снимков CC BY-SA 4.0 — attribution обязателен (см. photos.attribution
// и рекомендацию в README добавить строку на сайт).

import { MAPILLARY_GRAPH } from '../config.js';
import { getJson } from './http.js';
import { bearing, angleDiff, haversineMeters } from './geometry.js';

const FIELDS = 'id,computed_geometry,compass_angle,captured_at,is_pano,thumb_1024_url,owner';

// Все снимки в маленьком bbox вокруг здания (пагинация через next).
export async function fetchImagesAround(token, center, radiusM) {
  const dLat = radiusM / 111132;
  const dLng = radiusM / (111320 * Math.cos(center.lat * Math.PI / 180));
  const bbox = [
    (center.lng - dLng).toFixed(6), (center.lat - dLat).toFixed(6),
    (center.lng + dLng).toFixed(6), (center.lat + dLat).toFixed(6),
  ].join(',');
  const images = [];
  let url = `${MAPILLARY_GRAPH}/images?access_token=${token}&bbox=${bbox}&fields=${FIELDS}`;
  while (url) {
    const page = await getJson(url, null, { retries: 4, label: 'mapillary' });
    images.push(...(page.data || []));
    url = page.paging?.next?.startsWith(MAPILLARY_GRAPH) ? page.paging.next : null;
  }
  return images;
}

// Выбор снимка по ракурсу: камера стоит в 8–70 м и смотрит на здание
// (компас ±70° на центроид); не-панорамы точнее передают фасад.
export function pickFacadeShot(image, center, { viewToleranceDeg = 70, minDist = 8, maxDist = 70 } = {}) {
  const geo = image.computed_geometry || image.geometry;
  if (!geo || !image.thumb_1024_url) return null;
  const dist = haversineMeters(geo.lat, geo.lng, center.lat, center.lng);
  if (dist < minDist || dist > maxDist) return null;

  const camToBuilding = bearing(geo.lat, geo.lng, center.lat, center.lng);
  const compass = image.compass_angle;
  if (compass == null) return null;
  const viewMatchDeg = angleDiff(compass, camToBuilding);
  if (viewMatchDeg > viewToleranceDeg) return null;

  const viewMatch = 1 - viewMatchDeg / 180; // 1 = точно в фасад
  const score = viewMatch * 2 - (dist / maxDist) * 0.5 - (image.is_pano ? 0.3 : 0);
  return {
    cameraLat: geo.lat,
    cameraLng: geo.lng,
    distanceM: dist,
    viewMatch,
    score,
    attribution: `© ${image.owner?.username || 'Mapillary contributor'} / Mapillary, CC BY-SA 4.0`,
  };
}

export function bestPhoto(images, center, opts) {
  let best = null;
  for (const img of images) {
    const shot = pickFacadeShot(img, center, opts);
    if (shot && (!best || shot.score > best.score)) best = { image: img, ...shot };
  }
  return best;
}

export function attributionFor(image) {
  return `© ${image.owner?.username || 'Mapillary contributor'} / Mapillary, CC BY-SA 4.0`;
}

export async function downloadThumb(url) {
  const { fetchWithRetry } = await import('./http.js');
  const resp = await fetchWithRetry(url, null, { retries: 3, label: 'mapillary-cdn' });
  const buf = Buffer.from(await resp.arrayBuffer());
  return { base64: buf.toString('base64'), bytes: buf.length };
}
