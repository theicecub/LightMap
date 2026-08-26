// Диагностика «0 дорог»: показывает координаты кандидатов из Neon и проверяет
// запрос дорог именно по ним. Запуск: node --env-file=.env check-roads.js

import { db } from './lib/db.js';
import { buildRoadsAroundQuery, fetchOverpass } from './lib/overpass.js';

const sql = db();
const pending = await sql`SELECT id, lat, lng, name_ru FROM candidates WHERE roads_fetched = false ORDER BY id LIMIT 3`;
console.log('кандидатов без дорог (первые 3):');
for (const c of pending) console.log(`  #${c.id} ${c.name_ru || ''} lat=${c.lat} lng=${c.lng}`);

if (pending.length) {
  console.log('\nпробую запрос дорог по этим координатам...');
  const roads = await fetchOverpass(buildRoadsAroundQuery(pending), { label: 'check' });
  console.log(`дорог найдено: ${roads.length}`);
  for (const r of roads.slice(0, 5)) console.log(`  ${r.tags?.highway} — ${r.tags?.name || 'без названия'}`);
  if (!roads.length) {
    console.log('\n⚠ 0 дорог по валидным координатам Астаны — проблема на стороне зеркал.');
    console.log('  Координаты кандидатов выглядят так:', pending.map((c) => `${c.lat},${c.lng}`).join(' | '));
  }
} else {
  console.log('кандидатов без дорог не осталось — всё загружено.');
}
