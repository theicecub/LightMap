// Neon Postgres через HTTP-драйвер (@neondatabase/serverless, функция neon()).
// Работает и в Node, и в Vercel-функциях; scale-to-zero не мешает — первый запрос
// будит compute (~0.5с), это нормально для батч-пайплайна.

import { neon } from '@neondatabase/serverless';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { NEON_DATABASE_URL } from '../config.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

export function db() {
  if (!NEON_DATABASE_URL) throw new Error('DATABASE_URL не задан (см. pipeline/.env.example)');
  return neon(NEON_DATABASE_URL); // sql`` tagged template поверх fetch
}

// Применяет sql/schema.sql по предложениям. HTTP-драйвер Neon выполняет
// один стейтмент за раз, поэтому режем по «;» на концах строк (процедур в схеме нет).
export async function ensureSchema(sql) {
  const raw = readFileSync(join(__dirname, '..', 'sql', 'schema.sql'), 'utf8');
  const cleaned = raw
    .replace(/--[^\n]*/g, '')
    .split(';')
    .map((s) => s.trim())
    .filter(Boolean);
  for (const stmt of cleaned) await sql.query(stmt);
  console.log(`[db] схема применена (${cleaned.length} стейтментов)`);
}
