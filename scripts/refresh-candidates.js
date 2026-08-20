// ════════════════════════════════════════════════════════════════════════════
// LightMap — офлайн-обновление кэша зданий (building_candidates)
//
// Запускать вручную (`node scripts/refresh-candidates.js`) или по расписанию
// через GitHub Actions (см. .github/workflows/refresh-candidates.yml).
// В отличие от api/classify-buildings.js, здесь никто не ждёт ответа в
// моменте, поэтому таймауты гораздо щедрее: у публичных Overpass-зеркал
// есть реальный шанс успеть ответить, не упираясь в лимит serverless-функции.
// ════════════════════════════════════════════════════════════════════════════

const { neon } = require('@neondatabase/serverless');
const {
  getOverpassQuery,
  queryOverpass,
  buildCandidates,
  ensureCandidateTable,
  storeCandidates,
} = require('../api/classify-buildings.js');

const OFFLINE_OVERRIDES = {
  timeoutMs: 20000, // на каждую попытку — гораздо больше, чем 9с в живом пути
  budgetMs: 4 * 60 * 1000, // 4 минуты на весь перебор endpoint × mode
};

async function main() {
  const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (!databaseUrl) {
    console.error('DATABASE_URL (или POSTGRES_URL) не задан.');
    process.exitCode = 1;
    return;
  }

  console.log('[refresh-candidates] Запрашиваю Overpass (это может занять пару минут)…');
  const buildingWays = await queryOverpass(getOverpassQuery(), OFFLINE_OVERRIDES);
  if (buildingWays.length === 0) {
    console.error('[refresh-candidates] Overpass не ответил ни с одного зеркала за отведённый бюджет. Кэш не тронут, попробуйте позже.');
    process.exitCode = 1;
    return;
  }

  const candidates = buildCandidates(buildingWays);
  console.log(`[refresh-candidates] Overpass вернул ${buildingWays.length} объектов, из них ${candidates.length} прошли фильтр по высоте/центроиду.`);
  if (candidates.length === 0) {
    console.warn('[refresh-candidates] После фильтрации кандидатов нет — кэш не обновлён.');
    return;
  }

  const sql = neon(databaseUrl);
  await ensureCandidateTable(sql);
  await storeCandidates(sql, candidates);
  console.log(`[refresh-candidates] Готово: ${candidates.length} зданий записано в building_candidates.`);
}

main().catch((error) => {
  console.error('[refresh-candidates] Ошибка:', error);
  process.exitCode = 1;
});