const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const source = fs.readFileSync(path.resolve(__dirname, '..', 'ui-utils.js'), 'utf8');
const buildings = JSON.parse(fs.readFileSync(path.resolve(__dirname, '..', 'buildings.json'), 'utf8'));
const context = {};
vm.runInNewContext(`${source}\nglobalThis.uiUtils = { escapeHtml, getLocalizedBuildingField };`, context);

test('escapeHtml encodes text from external APIs before it reaches HTML', () => {
  assert.equal(
    context.uiUtils.escapeHtml('<img src=x onerror="alert(1)">'),
    '&lt;img src=x onerror=&quot;alert(1)&quot;&gt;',
  );
});

test('getLocalizedBuildingField selects the requested language with a safe fallback', () => {
  const building = {
    address: 'Русский адрес',
    address_en: 'English address',
    address_kk: 'Qazaqsha mekenjai',
  };

  assert.equal(context.uiUtils.getLocalizedBuildingField(building, 'address', 'en'), 'English address');
  assert.equal(context.uiUtils.getLocalizedBuildingField(building, 'address', 'kk'), 'Qazaqsha mekenjai');
  assert.equal(context.uiUtils.getLocalizedBuildingField({ address: 'Русский адрес' }, 'address', 'kk'), 'Русский адрес');
});

test('building text is valid UTF-8 rather than mojibake from a legacy code page', () => {
  const fields = ['name', 'address', 'glass'];
  for (const building of buildings) {
    for (const field of fields) {
      assert.doesNotMatch(building[field] || '', /(?:Р.|С.){2,}/u);
    }
  }
});

test('voice-alert module uses only the warning MP3 asset for every supported language', () => {
  const audioSource = fs.readFileSync(path.resolve(__dirname, '..', 'glare-audio.js'), 'utf8');
  for (const lang of ['ru', 'en', 'kk']) {
    assert.match(audioSource, new RegExp(`glare-warning-${lang}\\.mp3`));
  }
  assert.doesNotMatch(audioSource, /glare-danger/);
  assert.doesNotMatch(audioSource, /level/);
});
