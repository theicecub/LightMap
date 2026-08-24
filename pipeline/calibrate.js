// Калибровка baseLux на существующих 29 зданиях buildings.json (датасет-эталон).
//
//   node calibrate.js              — по кэшу pipeline/calibration-levels.json (offline)
//   node calibrate.js --fetch      — подтянуть этажность из Overpass (around:30, 1 запрос)
//
// Модель: baseLux = K(категория) × (levels/10)^ALPHA × (C_FLOOR + (1−C_FLOOR)·coverage).
// Для эталона coverage неизвестен → считаем 1 (полное остекление), тогда
// K_cat = median(baseLux_набл / (levels/10)^ALPHA).

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { loadBuildingsJson } from './lib/runner.js';
import { mapFreeTextGlass, GLASS_CATEGORIES } from './lib/categories.js';
import { fetchOverpass } from './lib/overpass.js';
import { haversineMeters } from './lib/geometry.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const LEVELS_CACHE = join(__dirname, 'calibration-levels.json');
const PARAMS_OUT = join(__dirname, 'baselux-params.json');

const ALPHA = 0.35;        // сублинейный рост с этажностью
const REF_LEVELS = 10;     // нормировка: 10 этажей → фактор 1
const MAX_FACTOR = 1.3;    // насыщение для высоток
const C_FLOOR = 0.55;      // минимальный вклад coverage

async function fetchLevelsFromOverpass(buildings) {
  const filters = buildings
    .map((b) => `way(around:30,${b.lat},${b.lng})["building"];`)
    .join('\n  ');
  const query = `[out:json][timeout:120];\n(\n  ${filters}\n);\nout tags center;`;
  const elements = await fetchOverpass(query, { label: 'calibration' });

  const levels = {};
  for (const b of buildings) {
    let best = null, bestDist = Infinity;
    for (const el of elements) {
      if (el.type !== 'way' || !el.center) continue;
      const d = haversineMeters(el.center.lat, el.center.lon, b.lat, b.lng);
      if (d < bestDist) { bestDist = d; best = el; }
    }
    const lv = parseFloat(best?.tags?.['building:levels']);
    const h = parseFloat(best?.tags?.height);
    levels[b.id] = {
      levels: Number.isFinite(lv) ? lv : (Number.isFinite(h) ? Math.round(h / 3.3) : null),
      matchedWay: best?.id || null, distM: Math.round(bestDist),
    };
  }
  writeFileSync(LEVELS_CACHE, JSON.stringify(levels, null, 2));
  console.log(`этажность записана в ${LEVELS_CACHE}`);
  return levels;
}

function median(arr) {
  const s = [...arr].sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)];
}

async function main() {
  const buildings = loadBuildingsJson();
  let levels;
  if (process.argv.includes('--fetch') || !existsSync(LEVELS_CACHE)) {
    levels = await fetchLevelsFromOverpass(buildings);
  } else {
    levels = JSON.parse(readFileSync(LEVELS_CACHE, 'utf8'));
  }

  const byCategory = {};
  const fit = [];
  for (const b of buildings) {
    const cat = mapFreeTextGlass(b.glass);
    if (!cat) { fit.push({ id: b.id, glass: b.glass, cat: null, note: 'нет маппинга — вне калибровки' }); continue; }
    const lv = levels[b.id]?.levels ?? REF_LEVELS;
    const lf = Math.min(MAX_FACTOR, Math.pow((lv || REF_LEVELS) / REF_LEVELS, ALPHA));
    byCategory[cat] = byCategory[cat] || [];
    byCategory[cat].push(b.baseLux / lf);
    fit.push({ id: b.id, glass: b.glass, cat, levels: lv, baseLux: b.baseLux });
  }

  const K = {};
  for (const [cat, vals] of Object.entries(byCategory)) {
    K[cat] = Math.round(median(vals) / 100) * 100;
  }
  // Категории без примеров в эталоне — консервативные стартовые значения
  // (отредактируй руками после первых проверок):
  K.tinted = K.tinted || 55000;

  const params = {
    _note: 'Сгенерировано pipeline/calibrate.js. K = медиана baseLux/(levels/10)^0.35 по buildings.json.',
    ALPHA, REF_LEVELS, MAX_FACTOR, C_FLOOR, K,
    DEFAULT_LEVELS: REF_LEVELS,
    calibratedOn: `${buildings.length} зданий, ${new Date().toISOString().slice(0, 10)}`,
  };
  writeFileSync(PARAMS_OUT, JSON.stringify(params, null, 2) + '\n');

  console.log('\nK по категориям (lux при 10 этажах и полном остеклении):');
  for (const [cat, k] of Object.entries(K)) {
    const n = byCategory[cat]?.length || 0;
    console.log(`  ${GLASS_CATEGORIES[cat]?.ru.padEnd(46)} K=${k}  (примеров: ${n})`);
  }
  console.log(`\nЗаписано: ${PARAMS_OUT}`);

  // Диагностика согласия формулы с эталоном.
  const { computeBaseLux } = await import('./lib/baselux.js');
  let sumAbsPct = 0, n = 0;
  for (const f of fit) {
    if (!f.cat) continue;
    const pred = computeBaseLux(f.cat, f.levels, 1, params);
    const pct = Math.abs(pred - f.baseLux) / f.baseLux * 100;
    sumAbsPct += pct; n++;
    if (pct > 30) console.log(`  ⚠ id=${f.id} ${f.glass}: эталон ${f.baseLux}, формула ${pred} (+${Math.round(pct)}%)`);
  }
  console.log(`\nСредняя ошибка формулы на эталоне: ${(sumAbsPct / n).toFixed(1)}% (n=${n})`);
}

main().catch((e) => { console.error(e); process.exit(1); });
