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
      winter: '10:04-14:22',
      spring: 'no glare',
      summer: 'no glare',
      autumn: 'no glare',
    },
  };

  assert.equal(context.popupTestApi.getSeasonKey(new Date('2025-01-15T12:00:00Z')), 'winter');
  assert.equal(context.popupTestApi.getDangerTimeForBuilding(building, new Date('2025-01-15T12:00:00Z')), '10:04-14:22');
  assert.equal(context.popupTestApi.getDangerTimeForBuilding(building, new Date('2025-06-01T12:00:00Z')), 'no glare');
  assert.equal(context.popupTestApi.isBuildingGlareActive(building, new Date('2025-01-15T06:00:00Z')), true);
  assert.equal(context.popupTestApi.isBuildingGlareActive(building, new Date('2025-01-15T05:00:00Z')), false);
  assert.equal(context.popupTestApi.isBuildingGlareActive(building, new Date('2025-06-01T06:00:00Z')), false);
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
    dangerTime_by_season: {
      winter: '00:00-23:59',
      spring: '00:00-23:59',
      summer: '00:00-23:59',
      autumn: '00:00-23:59',
    },
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
