// Общее для шагов: лог прогонов в runs, путь к buildings.json репозитория.

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
export const REPO_ROOT = join(__dirname, '..', '..');
export const BUILDINGS_JSON = join(REPO_ROOT, 'buildings.json');

export function loadBuildingsJson() {
  return JSON.parse(readFileSync(BUILDINGS_JSON, 'utf8'));
}

export async function runStep(sql, step, fn) {
  const rows = await sql`INSERT INTO runs (step) VALUES (${step}) RETURNING id`;
  const runId = rows[0].id;
  const stats = {};
  const count = (k, n = 1) => { stats[k] = (stats[k] || 0) + n; };
  try {
    await fn(count);
    await sql`UPDATE runs SET ok = true, stats = ${JSON.stringify(stats)}, finished_at = now() WHERE id = ${runId}`;
    console.log(`\n[${step}] готово: ${JSON.stringify(stats)}`);
  } catch (err) {
    await sql`UPDATE runs SET ok = false, stats = ${JSON.stringify(stats)}, finished_at = now() WHERE id = ${runId}`;
    console.error(`[${step}] упал: ${err.message}`);
    throw err;
  }
}
