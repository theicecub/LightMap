const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

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

test('driver mode manages a screen wake lock while active', () => {
  assert.match(source, /navigator\.wakeLock\.request\('screen'\)/);
  assert.match(source, /requestDriverWakeLock\(\);/);
  assert.match(source, /releaseDriverWakeLock\(\);/);
  assert.match(source, /document\.visibilityState === 'visible'/);
});
