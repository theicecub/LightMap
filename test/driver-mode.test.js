const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const source = fs.readFileSync(path.resolve(__dirname, '..', 'script.js'), 'utf8');

function sourceBetween(sourceText, startMarker, endMarker) {
  const start = sourceText.indexOf(startMarker);
  const end = sourceText.indexOf(endMarker, start);
  if (start === -1 || end === -1) {
    throw new Error(`Could not load source between ${startMarker} and ${endMarker}`);
  }
  return sourceText.slice(start, end);
}

test('enabling driver mode keeps built route layers visible', () => {
  const setDriverModeSource = sourceBetween(
    source,
    'function setDriverMode(active)',
    '\nfunction initDriverMode',
  );

  assert.doesNotMatch(setDriverModeSource, /setLayoutProperty\(/);
  assert.doesNotMatch(setDriverModeSource, /route-(?:alt|safe|warning|danger|points)/);
});

test('no-danger status uses a compact driver-mode value style', () => {
  assert.match(source, /classList\.toggle\('driver-danger-value--safe', distance == null\)/);

  const styles = fs.readFileSync(path.resolve(__dirname, '..', 'styles.css'), 'utf8');
  assert.match(
    styles,
    /\.driver-danger-value\.driver-danger-value--safe\s*\{\s*font-size:\s*16px;/,
  );
});

test('driver distance units are localized for every supported language', () => {
  for (const language of ['ru', 'en', 'kk']) {
    const languageSource = source.slice(source.indexOf(`  ${language}: {`));
    assert.match(languageSource, /meters:\s*'[^']+'/);
    assert.match(languageSource, /km:\s*'[^']+'/);
  }
});

test('nearest danger is recalculated from the latest GPS position', () => {
  const nearestDangerSource = sourceBetween(
    source,
    'function driverHaversine',
    '\nfunction updateDriverModeStatus',
  );
  const context = {
    Math,
    Number,
    buildings: [
      { level: 'danger', lat: 51.1, lng: 71.4 },
      { level: 'danger', lat: 51.2, lng: 71.5 },
      { level: 'warning', lat: 51.15, lng: 71.45 },
      { level: 'danger', lat: undefined, lng: 71.45 },
    ],
  };

  vm.runInNewContext(`${nearestDangerSource}\nglobalThis.driverTestApi = { driverHaversine, getNearestDangerDistance };`, context);

  const firstPosition = { lat: 51.1, lng: 71.401 };
  const secondPosition = { lat: 51.2, lng: 71.504 };
  const firstDistance = context.driverTestApi.getNearestDangerDistance(firstPosition);
  const secondDistance = context.driverTestApi.getNearestDangerDistance(secondPosition);
  assert.equal(firstDistance, context.driverTestApi.driverHaversine(firstPosition.lat, firstPosition.lng, 51.1, 71.4));
  assert.equal(secondDistance, context.driverTestApi.driverHaversine(secondPosition.lat, secondPosition.lng, 51.2, 71.5));
  assert.notEqual(firstDistance, secondDistance);
});

test('popup values remain within the available popup width', () => {
  const styles = fs.readFileSync(path.resolve(__dirname, '..', 'styles.css'), 'utf8');
  assert.match(styles, /\.popup-field-label\s*\{[^}]*min-width:\s*0;/s);
  assert.match(styles, /\.popup-field-value\s*\{[^}]*max-width:\s*48%;/s);
  assert.match(styles, /\.popup-field-value\s*\{[^}]*overflow-wrap:\s*anywhere;/s);
});

test('driver mode manages a screen wake lock while active', () => {
  assert.match(source, /navigator\.wakeLock\.request\('screen'\)/);
  assert.match(source, /requestDriverWakeLock\(\);/);
  assert.match(source, /releaseDriverWakeLock\(\);/);
  assert.match(source, /document\.visibilityState === 'visible'/);
});

test('driver mode requests a fresh GPS position instead of a cached one', () => {
  assert.match(source, /watchPosition\([\s\S]*maximumAge:\s*0/);
});
