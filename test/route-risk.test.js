const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const rootDir = path.resolve(__dirname, '..');
const scriptSource = fs.readFileSync(path.join(rootDir, 'script.js'), 'utf8');
const routeSource = fs.readFileSync(path.join(rootDir, 'route.js'), 'utf8');
const aiDetectSource = fs.readFileSync(path.join(rootDir, 'ai-detect.js'), 'utf8');
const classifyBuildings = require(path.join(rootDir, 'api', 'classify-buildings.js'));
const { normalizeClassification } = classifyBuildings;
const { rewriteStyle } = require(path.join(rootDir, 'api', 'maptiler.js'));

function sourceBetween(source, startMarker, endMarker) {
  const start = source.indexOf(startMarker);
  const end = source.indexOf(endMarker, start);
  if (start === -1 || end === -1) {
    throw new Error(`Could not load testable source between ${startMarker} and ${endMarker}`);
  }
  return source.slice(start, end);
}

const geocodeSource = sourceBetween(
  routeSource,
  'function getGeocodeCacheKey',
  '// ROUTING',
);

test('2GIS search sends requests through the same-origin proxy', async () => {
  let requestedUrl;
  const context = {
    ROUTE_CONFIG: {
      suggestUrl: '/api/suggest',
      cacheTTL: 300000,
      proximity: [71.43, 51.128],
      cityBbox: [71.1, 50.95, 71.8, 51.3],
      maxSuggestions: 6,
    },
    currentLang: 'ru',
    geocodeCache: new Map(),
    window: { location: { origin: 'https://lightmap.example' } },
    URL,
    Map,
    Date,
    Number,
    console,
    isAddressQuery: () => false,
    fetch: async url => {
      requestedUrl = String(url);
      return { ok: true, json: async () => ({ result: { items: [] } }) };
    },
  };

  vm.runInNewContext(`${geocodeSource}\nglobalThis.routeTestApi = { geocodeSearch };`, context);
  await context.routeTestApi.geocodeSearch('Keruen');

  assert.match(requestedUrl, /^https:\/\/lightmap\.example\/api\/suggest\?/);
  assert.match(requestedUrl, /(?:\?|&)q=Keruen(?:&|$)/);
});

const sunAndLuxSource = sourceBetween(
  scriptSource,
  'function getSunPosition',
  '\nfunction levelOf',
);
const routeRiskSource = sourceBetween(
  routeSource,
  'function haversine',
  '\nasync function buildSafeRoute',
);

function loadRiskFunctions({ now = new Date('2024-03-21T07:15:00.000Z'), buildings = [] } = {}) {
  class FixedDate extends Date {
    constructor(...args) {
      super(...(args.length ? args : [now.valueOf()]));
    }
  }

  const context = {
    ASTANA: { lat: 51.128, lng: 71.430 },
    ROUTE_CONFIG: {
      searchRadius: 300,
      segmentChunkSize: 100,
      sunAngleTolerance: 30,
    },
    weatherState: {
      cloudCover: 0,
      weatherCode: 0,
      loaded: false,
      error: false,
    },
    buildings,
    Date: FixedDate,
    Math,
    Map,
    Number,
    Set,
  };

  vm.runInNewContext(`
    ${sunAndLuxSource}
    ${routeRiskSource}
    globalThis.routeTestApi = {
      getSunPosition,
      computeWeatherMultiplier,
      computeEffectiveLux,
      haversine,
      pointToSegmentDist,
      computeVisibilityCoef,
      estimateExposureTime,
      distanceFalloff,
      evaluateRoute,
    };
  `, context);

  return { api: context.routeTestApi, context };
}

test('getSunPosition distinguishes solar noon from night and returns a valid azimuth', () => {
  const { api } = loadRiskFunctions();
  const equatorialNoon = api.getSunPosition(new Date('2024-03-21T12:00:00.000Z'), 0, 0);
  const equatorialMorning = api.getSunPosition(new Date('2024-03-21T09:00:00.000Z'), 0, 0);
  const equatorialEvening = api.getSunPosition(new Date('2024-03-21T15:00:00.000Z'), 0, 0);
  const astanaNight = api.getSunPosition(new Date('2024-03-21T00:00:00.000Z'), 51.128, 71.430);

  assert.ok(equatorialNoon.altitude > 89);
  assert.ok(equatorialMorning.azimuth > 80 && equatorialMorning.azimuth < 100);
  assert.ok(equatorialEvening.azimuth > 260 && equatorialEvening.azimuth < 280);
  assert.ok(astanaNight.altitude < 0);
});

test('haversine returns zero for one point, is symmetric, and matches one latitude degree', () => {
  const { api } = loadRiskFunctions();
  const oneDegree = api.haversine(0, 0, 1, 0);

  assert.equal(api.haversine(51.128, 71.430, 51.128, 71.430), 0);
  assert.ok(Math.abs(oneDegree - 111195) < 150);
  assert.equal(
    api.haversine(51.128, 71.430, 51.15, 71.47),
    api.haversine(51.15, 71.47, 51.128, 71.430),
  );
});

test('pointToSegmentDist handles perpendicular, endpoint, and zero-length segments', () => {
  const { api } = loadRiskFunctions();
  const start = { lat: 0, lng: 0 };
  const end = { lat: 0, lng: 0.001 };

  assert.ok(Math.abs(api.pointToSegmentDist({ lat: 0.001, lng: 0.0005 }, start, end) - 110.54) < 0.1);
  assert.ok(Math.abs(api.pointToSegmentDist({ lat: 0, lng: 0.002 }, start, end) - 111.32) < 0.1);
  assert.ok(Math.abs(api.pointToSegmentDist({ lat: 0.001, lng: 0 }, start, start) - 110.54) < 0.1);
});

test('risk helpers apply distance falloff, exposure time, and directional visibility', () => {
  const { api } = loadRiskFunctions();
  const segmentStart = { lat: 51.128, lng: 71.430 };
  const segmentEnd = { lat: 51.128, lng: 71.431 };

  assert.equal(api.distanceFalloff(0, 300), 1);
  assert.equal(api.distanceFalloff(150, 300), 0.5);
  assert.equal(api.distanceFalloff(300, 300), 0);
  assert.equal(api.estimateExposureTime(100, 60, 600), 10);
  assert.equal(api.computeVisibilityCoef({ orientation: 270 }, segmentStart, segmentEnd, 90), 1);
  assert.equal(api.computeVisibilityCoef({ orientation: 90 }, segmentStart, segmentEnd, 90), 0.1);
});

test('evaluateRoute scores only nearby buildings and preserves contribution totals', () => {
  const { api, context } = loadRiskFunctions();
  const coordinates = [
    [71.430, 51.128],
    [71.431, 51.128],
  ];
  const sun = api.getSunPosition(new Date('2024-03-21T07:15:00.000Z'), 51.128, 71.430);
  const nearbyBuilding = {
    id: 'nearby',
    lat: 51.128,
    lng: 71.4305,
    baseLux: 1000000,
    orientation: (sun.azimuth + 180) % 360,
  };
  context.buildings = [
    nearbyBuilding,
    { id: 'distant', lat: 51.138, lng: 71.4305, baseLux: 100000, orientation: 0 },
  ];
  const distance = api.haversine(51.128, 71.430, 51.128, 71.431);

  const result = api.evaluateRoute({ coordinates }, 60, distance);
  const segment = result.segments[0];

  assert.equal(result.segments.length, 1);
  assert.equal(segment.nearbyBuildings.length, 1);
  assert.equal(segment.nearbyBuildings[0].building.id, 'nearby');
  assert.equal(segment.nearbyBuildings[0].lux, api.computeEffectiveLux(nearbyBuilding, 1));
  assert.equal(result.totalRiskScore, segment.riskScore);
  assert.equal(segment.nearbyBuildings[0].contribution, segment.riskScore);
  assert.ok(result.totalRiskScore > 0);
  assert.equal(result.dangerZoneCount, 1);
});

function loadAiDetectFunctions() {
  const context = {
    Math,
    Number,
    String,
    Array,
    Set,
    escapeHtml: value => String(value ?? '').replace(/</g, '&lt;').replace(/>/g, '&gt;'),
    haversine: (lat1, lng1, lat2, lng2) => {
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLng = (lng2 - lng1) * Math.PI / 180;
      const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
      return 6371000 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    },
  };
  vm.runInNewContext(`${aiDetectSource}\nglobalThis.aiTestApi = { normalizeAiCandidate, dedupeAiCandidates };`, context);
  return context.aiTestApi;
}

test('AI candidates are deduplicated against manual buildings and each other', () => {
  const { normalizeAiCandidate, dedupeAiCandidates } = loadAiDetectFunctions();
  const candidates = [
    normalizeAiCandidate({ name: 'Duplicate', lat: 51.128, lng: 71.430, baseLux: 40000, confidence: 'high' }, 0),
    normalizeAiCandidate({ name: 'New', lat: 51.134, lng: 71.440, baseLux: 40000, confidence: 'medium' }, 1),
    normalizeAiCandidate({ name: 'New nearby', lat: 51.1341, lng: 71.4401, baseLux: 40000, confidence: 'medium' }, 2),
  ];
  const result = dedupeAiCandidates(candidates, [{ lat: 51.1281, lng: 71.4301 }]);
  assert.equal(result.length, 1);
  assert.equal(result[0].name, 'New');
  assert.equal(result[0].id, 100001);
});

test('Groq structured output validation rejects malformed values', () => {
  const ids = new Set(['123']);
  assert.equal(normalizeClassification({ osm_id: '123', material_guess: 'glass', reflectivity: 1.2, confidence: 'high', reasoning: 'x' }, ids), null);
  assert.equal(normalizeClassification({ osm_id: '123', material_guess: 'unsupported', reflectivity: 0.6, confidence: 'high', reasoning: 'x' }, ids), null);
  assert.equal(normalizeClassification({ osm_id: 'not-requested', material_guess: 'glass', reflectivity: 0.6, confidence: 'high', reasoning: 'x' }, ids), null);
  const valid = normalizeClassification({ osm_id: '123', material_guess: 'glass', reflectivity: 0.6, confidence: 'low', reasoning: '<unsafe>' }, ids);
  assert.equal(valid.reasoning, '&lt;unsafe&gt;');
});

test('classification endpoint degrades to an empty list when secrets are unavailable', async () => {
  const databaseUrl = process.env.DATABASE_URL;
  const postgresUrl = process.env.POSTGRES_URL;
  const groqKey = process.env.GROQ_API_KEY;
  delete process.env.DATABASE_URL;
  delete process.env.POSTGRES_URL;
  delete process.env.GROQ_API_KEY;

  let statusCode = null;
  let payload = null;
  const response = {
    status(code) { statusCode = code; return this; },
    json(value) { payload = value; return this; },
  };
  await classifyBuildings({ method: 'GET' }, response);

  if (databaseUrl === undefined) delete process.env.DATABASE_URL;
  else process.env.DATABASE_URL = databaseUrl;
  if (postgresUrl === undefined) delete process.env.POSTGRES_URL;
  else process.env.POSTGRES_URL = postgresUrl;
  if (groqKey === undefined) delete process.env.GROQ_API_KEY;
  else process.env.GROQ_API_KEY = groqKey;

  assert.equal(statusCode, 200);
  assert.deepEqual(payload, { buildings: [] });
});

test('MapTiler style proxy preserves MapLibre glyph placeholders and sprite paths', () => {
  const style = rewriteStyle({
    glyphs: 'https://api.maptiler.com/fonts/{fontstack}/{range}.pbf?key=secret',
    sprite: 'https://api.maptiler.com/sprites/general/sprite?key=secret',
  });
  assert.equal(style.glyphs, '/api/maptiler?path=%2Ffonts%2F{fontstack}%2F{range}.pbf');
  assert.equal(style.sprite, '/api/maptiler?path=%2Fsprites%2Fgeneral%2Fsprite');
});
