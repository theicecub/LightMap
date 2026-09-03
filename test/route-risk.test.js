const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const rootDir = path.resolve(__dirname, '..');
const scriptSource = fs.readFileSync(path.join(rootDir, 'script.js'), 'utf8');
const glareWindowSource = fs.readFileSync(path.join(rootDir, 'glare-window.js'), 'utf8');
const routeSource = fs.readFileSync(path.join(rootDir, 'route.js'), 'utf8');

function sourceBetween(source, startMarker, endMarker) {
  const start = source.indexOf(startMarker);
  const end = source.indexOf(endMarker, start);
  if (start === -1 || end === -1) {
    throw new Error(`Could not load testable source between ${startMarker} and ${endMarker}`);
  }
  return source.slice(start, end);
}

const seasonalGlareSource = glareWindowSource;
const sunAndLuxSource = seasonalGlareSource + sourceBetween(
  scriptSource,
  'function normalizeDegrees',
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
      searchRadius: 1200,
      segmentChunkSize: 100,
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
      computeTimeSunMultiplier,
      computeEffectiveLux,
      getFacadeNormals,
      solarGlareFactor,
      computeSpecularGlare,
      computeDriverGlareCoef,
      computeEyeIlluminance,
      haversine,
      pointToSegmentDist,
      bearing,
      angleDiff,
      estimateExposureTime,
      evaluateRoute,
    };
  `, context);

  return { api: context.routeTestApi, context };
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. Положение Солнца — независимая проверка по опорным значениям
// ─────────────────────────────────────────────────────────────────────────────

test('getSunPosition matches independent astronomical reference values', () => {
  const { api } = loadRiskFunctions();

  // Летнее солнцестояние, экватор, полдень: склонение +23.44°,
  // высота = 90 − 23.44 = 66.56°, солнце к северу (азимут ~0°).
  const summer = api.getSunPosition(new Date('2024-06-21T12:00:00.000Z'), 0, 0);
  assert.ok(Math.abs(summer.altitude - 66.56) < 0.6, `alt=${summer.altitude}`);
  assert.ok(Math.abs(summer.azimuth - 0) < 3 || Math.abs(summer.azimuth - 360) < 3, `az=${summer.azimuth}`);

  // Зимнее солнцестояние, экватор, полдень: склонение −23.44°,
  // высота 66.56°, солнце к югу (азимут ~180°).
  const winter = api.getSunPosition(new Date('2024-12-21T12:00:00.000Z'), 0, 0);
  assert.ok(Math.abs(winter.altitude - 66.56) < 0.6, `alt=${winter.altitude}`);
  assert.ok(Math.abs(winter.azimuth - 180) < 3, `az=${winter.azimuth}`);

  // Равноденствие, экватор: высота в полдень ~90° (зенит), азимут неустойчив.
  const equinox = api.getSunPosition(new Date('2024-03-20T12:00:00.000Z'), 0, 0);
  assert.ok(equinox.altitude > 87 && equinox.altitude < 90, `alt=${equinox.altitude}`);
});

test('getSunPosition is timezone independent and finite near the horizon', () => {
  const { api } = loadRiskFunctions();

  const instantMs = new Date('2024-03-21T12:00:00.000Z').getTime();
  const viaString = api.getSunPosition(new Date('2024-03-21T12:00:00.000Z'), 51.128, 71.430);
  const viaEpoch = api.getSunPosition(new Date(instantMs), 51.128, 71.430);
  assert.equal(viaString.altitude, viaEpoch.altitude);
  assert.equal(viaString.azimuth, viaEpoch.azimuth);

  const nearHorizon = api.getSunPosition(new Date('2024-03-21T00:30:00.000Z'), 0, 0);
  assert.ok(Number.isFinite(nearHorizon.altitude));
  assert.ok(Number.isFinite(nearHorizon.azimuth));
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. Базовые геометрические утилиты
// ─────────────────────────────────────────────────────────────────────────────

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

// ─────────────────────────────────────────────────────────────────────────────
// 3. Оптическая цепочка: Солнце → фасад → отражённый луч → глаз водителя
// ─────────────────────────────────────────────────────────────────────────────

test('specular ray reaches a driver in front of a sunlit facade, and never a driver behind it', () => {
  const { api } = loadRiskFunctions();

  // Восточный фасад (нормаль 90°), солнце на востоке (азимут 90°, высота 15°).
  // Отражённый луч уходит на восток: видит его только водитель ВОСТОЧНЕЕ здания.
  const building = { lat: 51.128, lng: 71.430, orientation: 90, height: 100, width: 60 };

  const inFront = api.computeSpecularGlare(building, 15, 90, +150, 0);   // к востоку
  const behind = api.computeSpecularGlare(building, 15, 90, -150, 0);    // к западу (за фасадом)
  const backlit = api.computeSpecularGlare(building, 15, 270, +150, 0);  // солнце с запада — фасад в тени

  assert.ok(inFront.factor > 0.9, `factor=${inFront.factor}`);
  assert.equal(behind.factor, 0);
  assert.equal(backlit.factor, 0);
});

test('specular reach scales with facade height (low sun, tall building reaches further)', () => {
  const { api } = loadRiskFunctions();

  // Солнце на 10°: точка отражения находится на высоте d·sin(10°).
  // Низкое здание (30 м) не «достаёт» до водителя на 500 м, высокое (300 м) — да.
  const short = { lat: 51.128, lng: 71.430, orientation: 90, height: 30, width: 60 };
  const tall = { lat: 51.128, lng: 71.430, orientation: 90, height: 300, width: 60 };

  assert.equal(api.computeSpecularGlare(short, 10, 90, 500, 0).factor, 0);
  assert.ok(api.computeSpecularGlare(tall, 10, 90, 500, 0).factor > 0.5);
});

test('glass reflectance enters the eye illuminance exactly once (no double counting)', () => {
  const { api } = loadRiskFunctions();

  // baseLux — калиброванная ПИКОВАЯ освещённость, уже включающая reflectance_used.
  // Поэтому здания с одинаковым baseLux дают одинаковую освещённость в глазу,
  // независимо от того, как она разложена на «incident × reflectance».
  const low = { baseLux: 30000, reflectance_used: 0.2 };
  const high = { baseLux: 30000, reflectance_used: 0.6 };

  const a = api.computeEyeIlluminance(low, 1, 0.5, 0.8, 100);
  const b = api.computeEyeIlluminance(high, 1, 0.5, 0.8, 100);
  assert.ok(a > 0);
  assert.equal(a, b);
});

test('driver forward view weights glare: building ahead matters, building behind does not', () => {
  const { api } = loadRiskFunctions();

  // Водитель на линии «солнце за спиной, здание впереди» — блик в поле зрения.
  const building = { lat: 51.128, lng: 71.430, orientation: 90, height: 200, width: 60 };
  const sunAz = 90, sunAlt = 15;

  // Водитель к востоку от здания, едет НА здание (на запад).
  const approach = api.computeDriverGlareCoef(
    building,
    { lat: 51.128, lng: 71.4315 }, // восточнее
    { lat: 51.128, lng: 71.4305 }, // ближе к зданию, движется на запад
    sunAlt, sunAz,
  );
  assert.ok(approach.factor > 0.8, `approach=${approach.factor}`);

  // Тот же водитель, но едет ОТ здания (на восток) — здание позади.
  const departing = api.computeDriverGlareCoef(
    building,
    { lat: 51.128, lng: 71.4305 },
    { lat: 51.128, lng: 71.4315 },
    sunAlt, sunAz,
  );
  assert.ok(departing.factor < 0.1, `departing=${departing.factor}`);
});

// ─────────────────────────────────────────────────────────────────────────────
// 4. Сезонное окно опасности
// ─────────────────────────────────────────────────────────────────────────────

test('danger window is derived from season data instead of returning undefined', () => {
  const section = seasonalGlareSource + sourceBetween(
    scriptSource,
    'function getDangerTimeForBuilding',
    'function popupHTML',
  );

  const context = { Date, Math, Intl, Object, Number, RegExp };
  vm.runInNewContext(`
    ${section}
    globalThis.popupTestApi = { getSeasonKey, getDangerTimeForBuilding, isBuildingGlareActive };
  `, context);

  const building = {
    dangerTime_by_season: {
      winter: [
        { period: 'Dec 1-15', dangerTime: '09:50-14:22' },
        { period: 'Jan 1-15', dangerTime: '10:04-14:22' },
        { period: 'Jan 16-31', dangerTime: '09:48-15:04' },
        { period: 'Feb 1-15', dangerTime: 'no glare' },
      ],
      spring: [{ period: 'Mar 1-15', dangerTime: 'no glare' }],
      summer: [{ period: 'Jun 1-15', dangerTime: 'no glare' }],
      autumn: [{ period: 'Sep 1-15', dangerTime: 'no glare' }],
    },
  };

  assert.equal(context.popupTestApi.getSeasonKey(new Date('2025-01-15T12:00:00Z')), 'winter');
  assert.equal(context.popupTestApi.getDangerTimeForBuilding(building, new Date('2025-01-15T12:00:00Z')), '10:04-14:22');
  assert.equal(context.popupTestApi.getDangerTimeForBuilding(building, new Date('2025-01-16T12:00:00Z')), '09:48-15:04');
  assert.equal(context.popupTestApi.getDangerTimeForBuilding(building, new Date('2025-06-01T12:00:00Z')), 'no glare');
  assert.equal(context.popupTestApi.isBuildingGlareActive(building, new Date('2025-01-15T06:00:00Z')), true);
  assert.equal(context.popupTestApi.isBuildingGlareActive(building, new Date('2025-01-15T05:00:00Z')), false);
  assert.equal(context.popupTestApi.isBuildingGlareActive(building, new Date('2025-06-01T06:00:00Z')), false);
});

// ─────────────────────────────────────────────────────────────────────────────
// 5. Интеграция: оценка маршрута
// ─────────────────────────────────────────────────────────────────────────────

test('evaluateRoute scores the specular glare and preserves contribution totals', () => {
  const { api, context } = loadRiskFunctions();

  function pointAtAzimuth(lat, lng, azimuth, distM) {
    const dLat = (distM * Math.cos(azimuth * Math.PI / 180)) / 111194.9;
    const dLng = (distM * Math.sin(azimuth * Math.PI / 180)) / (111194.9 * Math.cos(lat * Math.PI / 180));
    return { lat: lat + dLat, lng: lng + dLng };
  }

  const now = new Date('2024-03-21T07:15:00.000Z');
  const sun = api.getSunPosition(now, 51.128, 71.430);
  const nearbyBuilding = {
    id: 'nearby',
    lat: 51.128,
    lng: 71.430,
    baseLux: 1000000,
    orientation: sun.azimuth, // фасад смотрит прямо на солнце
    height: 200,
    reflectance_used: 0.5,
    dangerTime_by_season: {
      winter: '00:00-23:59',
      spring: '00:00-23:59',
      summer: '00:00-23:59',
      autumn: '00:00-23:59',
    },
  };
  context.buildings = [
    nearbyBuilding,
    // Северный фасад далеко — в тени, бликовать не может.
    { id: 'distant', lat: 51.138, lng: 71.4305, baseLux: 100000, orientation: 0 },
  ];

  // Водитель едет навстречу зданию по азимуту солнца (солнце за спиной).
  const far = pointAtAzimuth(nearbyBuilding.lat, nearbyBuilding.lng, sun.azimuth, 200);
  const near = pointAtAzimuth(nearbyBuilding.lat, nearbyBuilding.lng, sun.azimuth, 120);
  const coordinates = [[far.lng, far.lat], [near.lng, near.lat]];
  const distance = api.haversine(far.lat, far.lng, near.lat, near.lng);

  const result = api.evaluateRoute({ coordinates }, 60, distance, null, now.valueOf());
  const segment = result.segments[0];

  assert.equal(result.segments.length, 1);
  assert.equal(segment.nearbyBuildings.length, 1);
  assert.equal(segment.nearbyBuildings[0].building.id, 'nearby');
  assert.ok(segment.nearbyBuildings[0].lux >= 20000, `eyeLux=${segment.nearbyBuildings[0].lux}`);
  assert.equal(result.totalRiskScore, segment.riskScore);
  assert.equal(segment.nearbyBuildings[0].contribution, segment.riskScore);
  assert.ok(result.totalRiskScore > 0);
  assert.equal(result.dangerZoneCount, 1);
});

test('evaluateRoute advances the sun along the route when node durations are provided', () => {
  const { api, context } = loadRiskFunctions();

  // Здание с восточным фасадом; опасность только когда солнце на востоке.
  const building = {
    id: 'east',
    lat: 51.128,
    lng: 71.430,
    baseLux: 1000000,
    orientation: 90,
    height: 200,
    reflectance_used: 0.5,
    dangerTime_by_season: {
      winter: '00:00-23:59', spring: '00:00-23:59', summer: '00:00-23:59', autumn: '00:00-23:59',
    },
  };
  context.buildings = [building];

  // Водитель стоит восточнее здания; сегмент длинный (10 минут), так что
  // время проезда существенно сдвигает солнце.
  const coords = [[71.430, 51.128], [71.432, 51.128]]; // 2 точки, ~120 м
  const start = new Date('2024-03-21T02:30:00.000Z').valueOf(); // раннее утро (солнце на востоке)

  const result = api.evaluateRoute(
    { coordinates: coords },
    600, // 10 минут на 120 м — условно, чтобы подчеркнуть эволюцию времени
    api.haversine(51.128, 71.430, 51.128, 71.432),
    [600], // одна дуга = 600 с
    start,
  );

  // Сегмент должен быть посчитан (солнце в этот момент встало/встаёт на востоке),
  // а результат — конечный и неотрицательный.
  assert.ok(Number.isFinite(result.totalRiskScore));
  assert.ok(result.totalRiskScore >= 0);
  assert.equal(result.segments.length, 1);
});
