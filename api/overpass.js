// ════════════════════════════════════════════════════════════════════════════
// Vercel Serverless Function — прокси к Overpass API
// ────────────────────────────────────────────────────────────────────────────
// Куда положить: создай папку /api в корне проекта и сохрани этот файл как
//   /api/overpass.js
// Vercel автоматически поднимет его по адресу  /api/overpass
//
// Зачем: браузерный fetch к overpass-api.de с прод-домена блокируется (CORS +
// 406 по Origin). Здесь запрос уходит с сервера Vercel (server-to-server), где
// CORS не действует, а ответ мы отдаём фронтенду уже со своим Access-Control-
// Allow-Origin. Локально это работает через `vercel dev`.
// ════════════════════════════════════════════════════════════════════════════

const OVERPASS_ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://overpass.osm.ch/api/interpreter',
];

export default async function handler(req, res) {
  // Разрешаем вызов с любого источника (это твой собственный прокси)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  // Тело может прийти как объект { query } или как сырой текст
  let query = '';
  if (typeof req.body === 'string') {
    query = req.body;
  } else if (req.body && typeof req.body.query === 'string') {
    query = req.body.query;
  }
  query = (query || '').replace(/^\uFEFF/, '').replace(/\u00A0/g, ' ').trim();

  if (!query || query.includes('undefined') || /\(\s*\)/.test(query)) {
    res.status(400).json({ error: 'Empty or invalid Overpass query' });
    return;
  }

  let lastErr = null;
  for (const endpoint of OVERPASS_ENDPOINTS) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 55000);
      const upstream = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'data=' + encodeURIComponent(query),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!upstream.ok) {
        lastErr = `Overpass ${endpoint} -> HTTP ${upstream.status}`;
        continue; // пробуем следующий эндпоинт
      }
      const json = await upstream.json();
      res.status(200).json(json);
      return;
    } catch (err) {
      lastErr = `${endpoint}: ${err.name} ${err.message}`;
      // и пробуем следующий
    }
  }

  res.status(502).json({ error: 'All Overpass endpoints failed', detail: lastErr });
}
