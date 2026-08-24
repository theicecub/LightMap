// baseLux без ИИ: baseLux = K(категория) × L(этажность) × C(доля остекления).
// K калибруется на 29 зданиях buildings.json (см. pipeline/calibrate.js),
// параметры лежат в pipeline/baselux-params.json.

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { CATEGORY_SLUGS } from './categories.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PARAMS_PATH = join(__dirname, '..', 'baselux-params.json');

let cached = null;

export function loadParams() {
  if (!cached) cached = JSON.parse(readFileSync(PARAMS_PATH, 'utf8'));
  return cached;
}

// L(levels): слабый сублинейный рост с этажностью, насыщение у высоток.
function levelsFactor(levels, { ALPHA, REF_LEVELS, MAX_FACTOR }) {
  const l = Math.max(1, levels || REF_LEVELS);
  return Math.min(MAX_FACTOR, Math.pow(l / REF_LEVELS, ALPHA));
}

// C(coverage): доля остекления 0→0.55, 1→1 (даже слабо остеклённый фасад даёт блик).
function coverageFactor(coverage, { C_FLOOR }) {
  const c = Math.max(0, Math.min(1, coverage ?? 1));
  return C_FLOOR + (1 - C_FLOOR) * c;
}

export function computeBaseLux(category, levels, coverage, params = loadParams()) {
  if (!CATEGORY_SLUGS.includes(category)) throw new Error(`неизвестная категория: ${category}`);
  const k = params.K[category];
  if (!k) throw new Error(`в baselux-params.json нет K для «${category}» — запусти pipeline/calibrate.js`);
  const lux = k * levelsFactor(levels, params) * coverageFactor(coverage, params);
  return Math.round(Math.max(5000, Math.min(95000, lux)) / 100) * 100; // кламп + округление
}
