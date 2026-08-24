// Шаг 5. Ревью и публикация. buildings.json — по-прежнему финальный опубликованный
// список; пайплайн только добавляет записи после явного одобрения.
//
//   node steps/05-publish.js --stats              счётчики по статусам + очередь
//   node steps/05-publish.js --list               что готово к публикации
//   node steps/05-publish.js --show <candidateId> детали + черновая запись
//   node steps/05-publish.js --approve <id> [заметка]   одобрить из очереди
//   node steps/05-publish.js --reject <id> [заметка]    отклонить из очереди
//   node steps/05-publish.js --publish             дописать в buildings.json
//                                                     (бэкап buildings.json.bak-<ts>)

import { readFileSync, writeFileSync, copyFileSync } from 'node:fs';
import { db, ensureSchema } from '../lib/db.js';
import { BUILDINGS_JSON } from '../lib/runner.js';
import { requireEnv } from '../config.js';

const arg = (name) => {
  const i = process.argv.indexOf(`--${name}`);
  return i === -1 ? null : (process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : true);
};

async function readyRecords(sql) {
  // Готовы: высокодостоверные (ready) + одобренные ревьюером из очереди.
  const hi = await sql`
    SELECT c.id, c.name_ru, c.base_lux, c.orientation, c.period, c.danger_time,
           c.address_ru, cl.glass_category, cl.confidence, 'ready' AS source
    FROM candidates c JOIN classifications cl ON cl.candidate_id = c.id
    WHERE c.status = 'ready'`;
  const approved = await sql`
    SELECT c.id, c.name_ru, c.base_lux, c.orientation, c.period, c.danger_time,
           c.address_ru, cl.glass_category, cl.confidence, 'approved' AS source
    FROM candidates c
      JOIN review_queue rq ON rq.candidate_id = c.id AND rq.decision = 'approved'
      JOIN classifications cl ON cl.candidate_id = c.id
    WHERE c.status = 'approved'`;
  return [...hi, ...approved];
}

async function main() {
  requireEnv();
  const sql = db();
  await ensureSchema(sql);

  if (arg('stats')) {
    const statuses = await sql`SELECT status, count(*)::int AS n FROM candidates GROUP BY status ORDER BY status`;
    console.log('Кандидаты по статусам:');
    for (const s of statuses) console.log(`  ${s.status.padEnd(12)} ${s.n}`);
    const noPhoto = await sql`
      SELECT coalesce(sum((e.value)::int), 0)::int AS n
      FROM runs, jsonb_each(runs.stats) AS e WHERE e.key = 'no_photo'`;
    console.log(`Пропусков «нет фото» суммарно: ${noPhoto[0].n}`);
    const queue = await sql`SELECT decision, count(*)::int AS n FROM review_queue GROUP BY decision`;
    console.log('Очередь ревью:', queue.map((q) => `${q.decision ?? 'ожидает'}=${q.n}`).join(' ') || 'пусто');
    return;
  }

  if (arg('list')) {
    const rows = await readyRecords(sql);
    if (!rows.length) return console.log('Ничего не готово к публикации.');
    for (const r of rows) {
      console.log(`#${r.id} [${r.source}] conf=${r.confidence} ${r.name_ru} — ${r.address_ru || '—'}`);
      console.log(`     ${r.glass_category}, orient=${r.orientation}°, ${r.base_lux} lx, ${r.period} ${r.danger_time}`);
    }
    return;
  }

  if (arg('show')) {
    const id = Number(arg('show'));
    const r = await sql`SELECT * FROM review_queue WHERE candidate_id = ${id}`;
    if (r.length) console.log(JSON.stringify(r[0], null, 2));
    const c = await sql`SELECT * FROM candidates WHERE id = ${id}`;
    if (c.length) console.log(JSON.stringify(c[0], null, 2));
    return;
  }

  const decide = arg('approve') ? 'approved' : arg('reject') ? 'rejected' : null;
  if (decide) {
    const id = Number(decide === 'approved' ? arg('approve') : arg('reject'));
    const note = process.argv[process.argv.indexOf(`--${decide === 'approved' ? 'approve' : 'reject'}`) + 2] || null;
    const r = await sql`
      UPDATE review_queue SET decision = ${decide}, note = ${note}, decided_at = now()
      WHERE candidate_id = ${id} RETURNING candidate_id`;
    if (!r.length) throw new Error(`#${id} нет в review_queue`);
    await sql`UPDATE candidates SET status = ${decide}, updated_at = now() WHERE id = ${id}`;
    console.log(`#${id} → ${decide}`);
    return;
  }

  if (arg('publish')) {
    const rows = await readyRecords(sql);
    if (!rows.length) return console.log('Нечего публиковать: нет ready/approved записей.');

    const buildings = JSON.parse(readFileSync(BUILDINGS_JSON, 'utf8'));
    let nextId = Math.max(...buildings.map((b) => b.id)) + 1;
    const ts = new Date().toISOString().replace(/[:.]/g, '-');
    copyFileSync(BUILDINGS_JSON, `${BUILDINGS_JSON}.bak-${ts}`);

    for (const r of rows) {
      const c = await sql`SELECT * FROM candidates WHERE id = ${r.id}`;
      const rec = c[0];
      const glass = (await import('../lib/categories.js')).GLASS_CATEGORIES[r.glass_category];
      buildings.push({
        id: nextId,
        name: rec.name_ru,
        address: rec.address_ru || '—',
        lat: Number(rec.lat.toFixed(14)),
        lng: Number(rec.lng.toFixed(14)),
        baseLux: rec.base_lux,
        period: rec.period,
        dangerTime: rec.danger_time,
        glass: glass.ru,
        orientation: rec.orientation,
        name_en: rec.name_en,
        address_en: rec.address_en || '—',
        glass_en: glass.en,
      });
      await sql`UPDATE candidates SET status = 'published', published_building_id = ${nextId}, updated_at = now() WHERE id = ${r.id}`;
      console.log(`добавлено: id=${nextId} ${rec.name_ru}`);
      nextId++;
    }

    writeFileSync(BUILDINGS_JSON, JSON.stringify(buildings, null, 2) + '\n');
    console.log(`\nbuildings.json обновлён (${buildings.length} записей), бэкап: buildings.json.bak-${ts}`);
    console.log('Проверь git diff и задеплой как обычно (Vercel).');
    return;
  }

  console.log('Использование: --stats | --list | --show <id> | --approve <id> | --reject <id> | --publish');
}

main().catch((e) => { console.error(e); process.exit(1); });
