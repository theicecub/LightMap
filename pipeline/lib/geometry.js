// Геометрия без зависимек: haversine, азимут, расстояние точка-отрезок, центроид,
// и ориентация фасада = наружная нормаль ребра полигона, обращённого к ближайшей дороге.

const R = Math.PI / 180;
const R_EARTH = 6371000;

export function toRad(d) { return d * R; }

export function haversineMeters(lat1, lng1, lat2, lng2) {
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R_EARTH * Math.asin(Math.sqrt(a));
}

// Азимут (0–359 от севера, по часовой) из точки 1 в точку 2. В Астане достаточно
// плоской аппроксимации на сфере.
export function bearing(lat1, lng1, lat2, lng2) {
  const y = Math.sin(toRad(lng2 - lng1)) * Math.cos(toRad(lat2));
  const x = Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) -
    Math.sin(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(toRad(lng2 - lng1));
  return (Math.atan2(y, x) / R + 360) % 360;
}

export function angleDiff(a, b) {
  let d = Math.abs(a - b);
  if (d > 180) d = 360 - d;
  return d;
}

// Локальная метрическая проекция вокруг опорной точки (масштаб по широте Астаны).
function localXY(lat, lng, ref) {
  const mPerDegLat = 111132;
  const mPerDegLng = 111320 * Math.cos(toRad(ref.lat));
  return { x: (lng - ref.lng) * mPerDegLng, y: (lat - ref.lat) * mPerDegLat };
}

// Расстояние от точки до отрезка (в метрах) + ближайшая точка отрезка.
export function pointToSegment(p, a, b) {
  const ref = { lat: p.lat, lng: p.lng };
  const P = localXY(p.lat, p.lng, ref);
  const A = localXY(a.lat, a.lng, ref);
  const B = localXY(b.lat, b.lng, ref);
  const dx = B.x - A.x, dy = B.y - A.y;
  const len2 = dx * dx + dy * dy;
  let t = len2 === 0 ? 0 : ((P.x - A.x) * dx + (P.y - A.y) * dy) / len2;
  t = Math.max(0, Math.min(1, t));
  const cx = A.x + t * dx, cy = A.y + t * dy;
  return { dist: Math.hypot(P.x - cx, P.y - cy), point: { x: cx, y: cy } };
}

export function centroidOfPolygon(polygon) {
  // Центроид по формуле шнурковичков; для не-выпуклых корректнее среднего точек.
  let area = 0, cx = 0, cy = 0;
  const n = polygon.length - 1;
  for (let i = 0; i < n; i++) {
    const [lat1, lng1] = polygon[i];
    const [lat2, lng2] = polygon[i + 1];
    const cross = lng1 * lat2 - lng2 * lat1;
    area += cross;
    cx += (lng1 + lng2) * cross;
    cy += (lat1 + lat2) * cross;
  }
  if (Math.abs(area) < 1e-12) {
    const sum = polygon.reduce((acc, [la, ln]) => ({ la: acc.la + la, ln: acc.ln + ln }), { la: 0, ln: 0 });
    return { lat: sum.la / polygon.length, lng: sum.ln / polygon.length };
  }
  area *= 0.5;
  return { lat: cy / (6 * area), lng: cx / (6 * area) };
}

// Ближайшая точка среди всех сегментов дорог (дороги: [[lat,lng],...] или [{lat,lng},...]).
export function nearestRoadPoint(point, roads) {
  const asPt = (x) => (Array.isArray(x) ? { lat: x[0], lng: x[1] } : x);
  let best = { dist: Infinity, point: null, roadIndex: -1 };
  roads.forEach((road, ri) => {
    for (let i = 0; i < road.length - 1; i++) {
      const r = pointToSegment(point, asPt(road[i]), asPt(road[i + 1]));
      if (r.dist < best.dist) best = { dist: r.dist, point: r.point, roadIndex: ri };
    }
  });
  return best;
}

const ROAD_WEIGHT = {
  motorway: 6, trunk: 6, motorway_link: 3, trunk_link: 3,
  primary: 5, primary_link: 2.5, secondary: 4, secondary_link: 2,
  tertiary: 3, tertiary_link: 1.5,
  unclassified: 2, residential: 2, living_street: 1.5, service: 1,
};

// ── Ориентация фасада (без ИИ) ───────────────────────────────────────────────
// Полигон здания + дороги: берём ребро полигона, чья середина ближе всех к дороге
// (с бонусом крупным дорогам), и требуем, чтобы наружная нормаль реально смотрела
// на ближайшую точку дороги (±75°). Возвращаем азимут нормали 0..359.
//
// ВАЖНО: «север» (0°) публикуется как 360 — в buildings.json 0 означает «неизвестно».
export function orientationFromRoads(polygon, roads, roadHighways = []) {
  const centroid = centroidOfPolygon(polygon);
  const edges = [];
  for (let i = 0; i < polygon.length - 1; i++) {
    const a = polygon[i], b = polygon[i + 1];
    if (haversineMeters(a[0], a[1], b[0], b[1]) < 3) continue; // мусорные микро-рёбра
    const mid = { lat: (a[0] + b[0]) / 2, lng: (a[1] + b[1]) / 2 };
    const near = nearestRoadPoint(mid, roads);
    if (!near.point || near.dist > 120) continue;
    const roadWeight = ROAD_WEIGHT[roadHighways[near.roadIndex]] ?? 1;
    edges.push({ a, b, mid, near, roadWeight });
  }
  if (!edges.length) return null;

  let best = null;
  for (const e of edges) {
    // Наружная нормаль: поворачиваем ребро на ±90°, берём ту, что от центроида.
    const edgeBearing = bearing(e.a[0], e.a[1], e.b[0], e.b[1]);
    const midBearingToCentroid = bearing(e.mid.lat, e.mid.lng, centroid.lat, centroid.lng);
    const candidates = [(edgeBearing + 90) % 360, (edgeBearing + 270) % 360];
    const outward = candidates
      .reduce((bestB, c) => (angleDiff(c, midBearingToCentroid) > angleDiff(bestB, midBearingToCentroid) ? c : bestB));

    // Нормаль должна смотреть на дорогу, а не в тыл здания.
    const nearLat = e.mid.lat + (e.near.point.y / 111132);
    const nearLng = e.mid.lng + (e.near.point.x / (111320 * Math.cos(toRad(e.mid.lat))));
    const bearingToRoad = bearing(e.mid.lat, e.mid.lng, nearLat, nearLng);
    if (angleDiff(outward, bearingToRoad) > 75) continue;

    // Оценка: близость к дороге + класс дороги.
    const score = e.near.dist - e.roadWeight * 8;
    if (!best || score < best.score) best = { score, orientation: outward };
  }
  if (!best) return null;

  const deg = Math.round(best.orientation) % 360;
  return deg === 0 ? 360 : deg; // 0 зарезервирован под «неизвестно» в route.js
}
