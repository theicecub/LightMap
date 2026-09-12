const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const script = fs.readFileSync(path.join(root, 'script.js'), 'utf8');
const styles = fs.readFileSync(path.join(root, 'styles.css'), 'utf8');

test('the startup locale uses the saved value and defaults to Kazakh before rendering', () => {
  assert.match(html, /<html lang="kk">/);
  assert.match(html, /window\.__initialLang = lang/);
  assert.match(html, /document\.documentElement\.lang = lang/);
  assert.match(html, /document\.documentElement\.classList\.add\('language-pending'\)/);
  assert.match(script, /let currentLang = window\.__initialLang \|\| 'kk';/);
  assert.match(script, /document\.documentElement\.classList\.remove\('language-pending'\)/);
});

test('UI localization starts before the buildings request completes', () => {
  const bootstrap = script.slice(script.indexOf('async function bootstrap()'), script.indexOf("if (document.readyState === 'loading')"));
  assert.ok(bootstrap.indexOf('initUi();') < bootstrap.indexOf('await loadBuildings();'));
});

test('green hover feedback is disabled for touch-only devices', () => {
  assert.match(styles, /@media \(hover: hover\) and \(pointer: fine\) \{[\s\S]*\.safe-points-toggle:hover[\s\S]*\.driver-mode-toggle:hover/);
  assert.doesNotMatch(styles, /\.driver-mode-toggle:hover,\s*\.driver-mode-toggle:active/);
});
