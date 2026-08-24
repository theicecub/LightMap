// Шаг 3. Классификация фасада через Groq free tier (qwen vision, JSON mode).
// Маленькие батчи (по умолчанию 20), мягкий rate limit ~15 RPM, backoff на 429.
//
//   node steps/03-classify.js [--limit N]

import { db, ensureSchema } from '../lib/db.js';
import { runStep } from '../lib/runner.js';
import { classifyFacade, GROQ_MODEL } from '../lib/groq.js';
import { requireEnv, GROQ_MAX_IMAGES_PER_RUN } from '../config.js';

const args = process.argv.slice(2);
const LIMIT = Number((args.find((a) => a.startsWith('--limit=')) || '').split('=')[1]) || GROQ_MAX_IMAGES_PER_RUN;

async function loadThumb(sql, photo) {
  if (photo.image_base64) return photo.image_base64;
  const { downloadThumb } = await import('../lib/mapillary.js');
  const { base64 } = await downloadThumb(photo.thumb_url);
  await sql`UPDATE photos SET image_base64 = ${base64} WHERE id = ${photo.id}`;
  return base64;
}

async function main() {
  requireEnv();
  const sql = db();
  await ensureSchema(sql);

  await runStep(sql, '03-classify', async (count) => {
    const { rows } = await sql`
      SELECT c.id AS candidate_id, c.name_ru, p.id AS photo_id, p.thumb_url, p.image_base64
      FROM candidates c
      JOIN photos p ON p.candidate_id = c.id AND p.selected = true
      WHERE c.status = 'photo_ok'
      ORDER BY c.id LIMIT ${LIMIT}`;
    console.log(`к классификации (${GROQ_MODEL}): ${rows.length}`);

    for (const row of rows) {
      try {
        const base64 = await loadThumb(sql, row);
        const result = await classifyFacade(base64);
        await sql`
          INSERT INTO classifications (candidate_id, photo_id, model, is_reflective,
                                       glass_category, glazing_coverage, confidence, raw_response)
          VALUES (${row.candidate_id}, ${row.photo_id}, ${GROQ_MODEL}, ${result.is_reflective},
                  ${result.glass_category}, ${result.glazing_coverage}, ${result.confidence},
                  ${JSON.stringify(result.raw)}::jsonb)
          ON CONFLICT (candidate_id) DO UPDATE SET photo_id = EXCLUDED.photo_id,
            model = EXCLUDED.model, is_reflective = EXCLUDED.is_reflective,
            glass_category = EXCLUDED.glass_category, glazing_coverage = EXCLUDED.glazing_coverage,
            confidence = EXCLUDED.confidence, raw_response = EXCLUDED.raw_response, created_at = now()`;
        await sql`UPDATE candidates SET status = 'classified', updated_at = now() WHERE id = ${row.candidate_id}`;
        count('classified');
        console.log(`  #${row.candidate_id} ${row.name_ru || ''} → ${result.glass_category}, conf=${result.confidence}`);
      } catch (err) {
        count('classify_errors');
        console.error(`  #${row.candidate_id} ошибка: ${err.message}`);
      }
    }
  });
}

main().catch((e) => { console.error(e); process.exit(1); });
