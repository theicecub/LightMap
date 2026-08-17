// ════════════════════════════════════════════════════════════════════════════
// LightMap — серверная классификация фасадов (Overpass + Gemini + Neon)
// ════════════════════════════════════════════════════════════════════════════

const { neon } = require('@neondatabase/serverless');

const CLASSIFY_CONFIG = {
  bbox: { south: 51.05, west: 71.28, north: 51.22, east: 71.58 },
  minHeightM: 20,
  maxRoadDistanceM: 150,
  maxCandidates: 250,
  batchSize: 25,
  overpassTimeoutMs: 45000,
  overpassEndpoints: [
    'https://overpass.kumi.systems/api/interpreter',
    'https://overpass-api.de/api/interpreter',
    'https://overpass.osm.ch/api/interpreter',
  ],
  geminiModel: 'gemini-2.0-flash-lite',
  materialGuesses: ['mirror', 'reflective', 'glass', 'tinted', 'low_e', 'metal', 'concrete', 'unknown'],
  confidenceLevels: ['low', 'medium', 'high'],
};

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&(?!(?:amp|lt|gt|quot|#39);)/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function parseNumericTag(value) {
  const match = String(value ?? '').replace(',', '.').match(/-?\d+(?:\.\d+)?/);
  return match ? Number(match[0]) : null;
}

function estimateHeightMeters(tags) {
  const height = parseNumericTag(tags.height);
  if (height && height > 0) return height;
  const levels = parseNumericTag(tags['building:levels']);
  return levels && levels > 0 ? levels * 3.2 : null;
}

function ringPoints(geometry) {
  const points = (geometry || [])
    .filter(point => Number.isFinite(point?.lat) && Number.isFinite(point?.lon))
    .map(point => ({ lat: point.lat, lon: point.lon }));
  if (points.length > 1) {
    const first = points[0];
    const last = points[points.length - 1];
    if (first.lat === last.lat && first.lon === last.lon) points.pop();
  }
  return points;
}

function polygonCentroid(points) {
  if (points.length < 3) return null;
  const totals = points.reduce((sum, point) => ({ lat: sum.lat + point.lat, lon: sum.lon + point.lon }), { lat: 0, lon: 0 });
  return { lat: totals.lat / points.length, lon: totals.lon / points.length };
}

function haversineMeters(lat1, lon1, lat2, lon2) {
  const radius = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return radius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function pointToSegmentDistance(point, start, end) {
  const scale = Math.cos(point.lat * Math.PI / 180);
  const toXY = value => ({ x: (value.lon - point.lon) * 111320 * scale, y: (value.lat - point.lat) * 110540 });
  const a = toXY(start);
  const b = toXY(end);
  const lenSq = (b.x - a.x) ** 2 + (b.y - a.y) ** 2;
  const t = lenSq === 0 ? 0 : Math.max(0, Math.min(1, (-a.x * (b.x - a.x) - a.y * (b.y - a.y)) / lenSq));
  return Math.hypot(a.x + t * (b.x - a.x), a.y + t * (b.y - a.y));
}

function estimateOrientation(points, centroid) {
  let longest = null;
  for (let index = 0; index < points.length; index += 1) {
    const start = points[index];
    const end = points[(index + 1) % points.length];
    const length = haversineMeters(start.lat, start.lon, end.lat, end.lon);
    if (!longest || length > longest.length) longest = { start, end, length };
  }
  if (!longest) return 0;
  const edge = Math.atan2(longest.end.lon - longest.start.lon, longest.end.lat - longest.start.lat) * 180 / Math.PI;
  const midpoint = { lat: (longest.start.lat + longest.end.lat) / 2, lon: (longest.start.lon + longest.end.lon) / 2 };
  const normalA = (edge + 90 + 360) % 360;
  const normalB = (edge + 270 + 360) % 360;
  const probe = (bearing) => ({ lat: midpoint.lat + Math.cos(bearing * Math.PI / 180) * 0.00005, lon: midpoint.lon + Math.sin(bearing * Math.PI / 180) * 0.00005 });
  const probeA = probe(normalA);
  const probeB = probe(normalB);
  return haversineMeters(probeA.lat, probeA.lon, centroid.lat, centroid.lon) > haversineMeters(probeB.lat, probeB.lon, centroid.lat, centroid.lon) ? normalA : normalB;
}

function minRoadDistance(centroid, roads) {
  let closest = Infinity;
  for (const road of roads) {
    const geometry = road.geometry || [];
    for (let index = 1; index < geometry.length; index += 1) {
      const distance = pointToSegmentDistance(centroid, geometry[index - 1], geometry[index]);
      if (distance < closest) closest = distance;
    }
  }
  return closest;
}

function estimateBaseLux(heightM, reflectivity) {
  const heightFactor = Math.min(1, 0.3 + heightM / 200);
  return Math.round(Math.max(10000, Math.min(100000, 100000 * reflectivity * heightFactor)));
}

function buildDangerWindow(orientation, baseLux, lat, lng) {
  const now = new Date();
  const windows = [];
  let start = null;
  for (let minute = 5 * 60; minute <= 21 * 60; minute += 15) {
    const probe = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, minute - 300));
    const sun = getSunPosition(probe, lat, lng);
    const angle = Math.min(Math.abs(sun.azimuth - orientation), 360 - Math.abs(sun.azimuth - orientation));
    const multiplier = sun.altitude <= 0 ? 0 : sun.altitude < 15 ? 1 : sun.altitude < 30 ? 0.85 : sun.altitude < 50 ? 0.5 : 0.25;
    const oriented = orientation && angle > 90 ? multiplier * 0.1 : multiplier;
    if (baseLux * oriented >= 10000 && start == null) start = minute;
    if ((baseLux * oriented < 10000 || minute === 21 * 60) && start != null) {
      const end = baseLux * oriented < 10000 ? minute - 15 : minute;
      windows.push([start, end]);
      start = null;
    }
  }
  const format = minute => `${String(Math.floor(minute / 60)).padStart(2, '0')}:${String(minute % 60).padStart(2, '0')}`;
  return windows.map(([startMinute, endMinute]) => `${format(startMinute)}-${format(endMinute)}`).join(' ') || 'Не определено';
}

function getSunPosition(date, lat, lng) {
  const rad = Math.PI / 180;
  const day = Math.floor((date - new Date(date.getFullYear(), 0, 0)) / 86400000);
  const declination = 23.45 * Math.sin(rad * (360 / 365) * (day - 81));
  const hourAngle = (date.getUTCHours() + date.getUTCMinutes() / 60 - (12 - lng / 15)) * 15;
  const sinAltitude = Math.sin(lat * rad) * Math.sin(declination * rad) + Math.cos(lat * rad) * Math.cos(declination * rad) * Math.cos(hourAngle * rad);
  const altitude = Math.asin(sinAltitude) / rad;
  const cosAzimuth = (Math.sin(declination * rad) - Math.sin(lat * rad) * sinAltitude) / (Math.cos(lat * rad) * Math.cos(Math.asin(sinAltitude)));
  let azimuth = Math.acos(Math.max(-1, Math.min(1, cosAzimuth))) / rad;
  if (hourAngle > 0) azimuth = 360 - azimuth;
  return { altitude, azimuth };
}

function getOverpassQueries() {
  const { south, west, north, east } = CLASSIFY_CONFIG.bbox;
  const bbox = `${south},${west},${north},${east}`;
  return {
    buildings: `[out:json][timeout:60];(way["building"]["height"](${bbox});way["building"]["building:levels"](${bbox}););out geom;`,
    roads: `[out:json][timeout:60];way["highway"~"^(trunk|primary|secondary|tertiary|residential|living_street|unclassified|trunk_link|primary_link|secondary_link|tertiary_link)$"](${bbox});out geom;`,
  };
}

async function queryOverpass(query) {
  for (const endpoint of CLASSIFY_CONFIG.overpassEndpoints) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), CLASSIFY_CONFIG.overpassTimeoutMs);
    try {
      const response = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: `data=${encodeURIComponent(query)}`, signal: controller.signal });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const body = await response.json();
      if (!Array.isArray(body.elements)) throw new Error('Unexpected response');
      return body.elements;
    } catch (error) {
      console.warn(`[AutoDetect] Overpass unavailable (${endpoint}):`, error.message);
    } finally {
      clearTimeout(timeout);
    }
  }
  return [];
}

function buildCandidates(buildings, roads) {
  return buildings.map((building) => {
    const tags = building.tags || {};
    const height = estimateHeightMeters(tags);
    const points = ringPoints(building.geometry);
    const centroid = polygonCentroid(points);
    if (!height || height < CLASSIFY_CONFIG.minHeightM || !centroid || minRoadDistance(centroid, roads) > CLASSIFY_CONFIG.maxRoadDistanceM) return null;
    return {
      osm_id: String(building.id),
      name: tags.name || `Здание (${centroid.lat.toFixed(4)}, ${centroid.lon.toFixed(4)})`,
      name_en: tags['name:en'] || tags.name || `Building (${centroid.lat.toFixed(4)}, ${centroid.lon.toFixed(4)})`,
      name_kk: tags['name:kk'] || '',
      address: [tags['addr:street'], tags['addr:housenumber']].filter(Boolean).join(', '),
      lat: centroid.lat,
      lng: centroid.lon,
      height,
      orientation: estimateOrientation(points, centroid),
      tags: { name: tags.name || '', building: tags.building || '', material: tags['building:material'] || '', levels: tags['building:levels'] || '', amenity: tags.amenity || '', shop: tags.shop || '' },
    };
  }).filter(Boolean).slice(0, CLASSIFY_CONFIG.maxCandidates);
}

function responseSchema() {
  return { type: 'ARRAY', items: { type: 'OBJECT', properties: { osm_id: { type: 'STRING' }, material_guess: { type: 'STRING', enum: CLASSIFY_CONFIG.materialGuesses }, reflectivity: { type: 'NUMBER' }, confidence: { type: 'STRING', enum: CLASSIFY_CONFIG.confidenceLevels }, reasoning: { type: 'STRING' } }, required: ['osm_id', 'material_guess', 'reflectivity', 'confidence', 'reasoning'] } };
}

function normalizeClassification(value, requestedIds) {
  if (!value || !requestedIds.has(String(value.osm_id)) || !CLASSIFY_CONFIG.materialGuesses.includes(value.material_guess) || !CLASSIFY_CONFIG.confidenceLevels.includes(value.confidence)) return null;
  const reflectivity = Number(value.reflectivity);
  if (!Number.isFinite(reflectivity) || reflectivity < 0 || reflectivity > 1) return null;
  return { osm_id: String(value.osm_id), material_guess: value.material_guess, reflectivity, confidence: value.confidence, reasoning: escapeHtml(String(value.reasoning).slice(0, 280)) };
}

async function classifyBatch(batch, apiKey) {
  const prompt = `Ты оцениваешь вероятный материал фасада зданий Астаны по OSM-тегам. Верни классификацию для каждого osm_id. reasoning: одно короткое предложение на русском.\nЗдания:\n${JSON.stringify(batch.map(({ osm_id, tags }) => ({ osm_id, ...tags })) )}`;
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${CLASSIFY_CONFIG.geminiModel}:generateContent?key=${encodeURIComponent(apiKey)}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { responseMimeType: 'application/json', responseSchema: responseSchema() } }),
  });
  if (!response.ok) throw new Error(`Gemini HTTP ${response.status}`);
  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  let parsed;
  try { parsed = JSON.parse(text); } catch { return []; }
  const ids = new Set(batch.map(item => item.osm_id));
  return Array.isArray(parsed) ? parsed.map(item => normalizeClassification(item, ids)).filter(Boolean) : [];
}

async function getClassifications(sql, ids) {
  if (ids.length === 0) return new Map();
  const rows = await sql.query('SELECT osm_id, material_guess, reflectivity, confidence, reasoning FROM building_classifications WHERE osm_id = ANY($1)', [ids]);
  return new Map(rows.map(row => [String(row.osm_id), row]));
}

async function storeClassifications(sql, classifications) {
  if (classifications.length === 0) return;
  await Promise.all(classifications.map(item => sql.query(
    'INSERT INTO building_classifications (osm_id, material_guess, reflectivity, confidence, reasoning) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (osm_id) DO NOTHING',
    [item.osm_id, item.material_guess, item.reflectivity, item.confidence, item.reasoning],
  )));
}

function toClientBuilding(candidate, classification) {
  const reflectivity = Number(classification.reflectivity);
  const baseLux = estimateBaseLux(candidate.height, reflectivity);
  return {
    osm_id: candidate.osm_id, name: escapeHtml(candidate.name), name_en: escapeHtml(candidate.name_en), name_kk: escapeHtml(candidate.name_kk),
    address: escapeHtml(candidate.address || 'Астана'), lat: candidate.lat, lng: candidate.lng, orientation: candidate.orientation,
    baseLux, glass: escapeHtml(classification.material_guess), confidence: classification.confidence,
    reasoning: escapeHtml(classification.reasoning), dangerTime: buildDangerWindow(candidate.orientation, baseLux, candidate.lat, candidate.lng),
  };
}

module.exports = async (req, res) => {
  if (req.method !== 'GET') return res.status(405).json({ buildings: [] });
  const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  const geminiKey = process.env.GEMINI_API_KEY;
  if (!databaseUrl || !geminiKey) {
    console.warn('[AutoDetect] GEMINI_API_KEY or DATABASE_URL is not configured');
    return res.status(200).json({ buildings: [] });
  }
  try {
    const [buildingWays, roads] = await Promise.all(Object.values(getOverpassQueries()).map(queryOverpass));
    const candidates = buildCandidates(buildingWays, roads);
    if (candidates.length === 0) return res.status(200).json({ buildings: [] });
    const sql = neon(databaseUrl);
    await sql.query('CREATE TABLE IF NOT EXISTS building_classifications (osm_id TEXT PRIMARY KEY, material_guess TEXT NOT NULL, reflectivity REAL NOT NULL, confidence TEXT NOT NULL, reasoning TEXT NOT NULL, classified_at TIMESTAMPTZ NOT NULL DEFAULT NOW())');
    const cached = await getClassifications(sql, candidates.map(item => item.osm_id));
    const missing = candidates.filter(item => !cached.has(item.osm_id));
    const created = [];
    for (let index = 0; index < missing.length; index += CLASSIFY_CONFIG.batchSize) {
      created.push(...await classifyBatch(missing.slice(index, index + CLASSIFY_CONFIG.batchSize), geminiKey));
    }
    await storeClassifications(sql, created);
    created.forEach(item => cached.set(item.osm_id, item));
    return res.status(200).json({ buildings: candidates.filter(item => cached.has(item.osm_id)).map(item => toClientBuilding(item, cached.get(item.osm_id))) });
  } catch (error) {
    console.warn('[AutoDetect] Classification unavailable:', error.message);
    return res.status(200).json({ buildings: [] });
  }
};

module.exports.normalizeClassification = normalizeClassification;
