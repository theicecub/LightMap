const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const source = fs.readFileSync(path.resolve(__dirname, '..', 'ui-utils.js'), 'utf8');
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
