// Groq free tier: единственный ИИ-шаг пайплайна — «стеклянный/зеркальный ли фасад».
// Модель: qwen/qwen3.6-27b (проверять актуальность: console.groq.com/docs/models;
// Groq депрекейтит preview-модели — переопределяется через GROQ_VISION_MODEL).
// JSON mode (response_format json_object) + строгая валидация на нашей стороне.

import { GROQ_API, GROQ_API_KEY, GROQ_MODEL, GROQ_MIN_INTERVAL_MS } from '../config.js';
import { getJson, sleep } from './http.js';
import { CATEGORY_SLUGS } from './categories.js';

let lastCallAt = 0;

const SYSTEM_PROMPT = `Ты — ассистент по архитектурной фотограмметрии. По фото здания определи тип фасадного остекления и его отражающую способность для оценки солнечных бликов (свет, слепящий водителей и пешеходов).

Категории glass_category (ТОЛЬКО одно значение из списка):
- "mirror" — зеркальное стекло: фасад выглядит как зеркало, отражает небо и окружающие здания
- "high_selective" — высокоселективное стекло: сильные отражения, зеленоватый/голубоватый металлический блеск
- "low_e_panoramic" — панорамное остекление, Low-E стеклопакеты: ленточное остекление этажей, умеренные отражения
- "tinted" — тонированное стекло: тёмное остекление с заметными отражениями
- "laminated" — ламинированное стекло: прозрачное/слегка тонированное, слабые отражения
- "curtain_wall" — стеклянный навесной фасад (структурное остекление, витражи): много стекла + видимая несущая структура
- "not_glass" — фасад НЕ стеклянный (кирпич, бетон, панель, штукатурка и т.п.)

Отвечай СТРОГО одним JSON-объектом без пояснений:
{
  "is_reflective": boolean,        // фасад может давать заметный солнечный блик
  "glass_category": "mirror" | "high_selective" | "low_e_panoramic" | "tinted" | "laminated" | "curtain_wall" | "not_glass",
  "glazing_coverage": number,      // доля площади фасада под остеклением, 0.0–1.0
  "confidence": number             // уверенность оценки по фото, 0.0–1.0
}
Если на фото не здание или фасад не видно — is_reflective=false, glass_category="not_glass", confidence=0.`;

function clamp01(v) {
  const n = Number(v);
  return Number.isFinite(n) ? Math.max(0, Math.min(1, n)) : null;
}

// Модель с thinking-режимом может оборачивать ответ в <think>…</think> — вырезаем.
function extractJson(text) {
  const cleaned = text.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start === -1 || end === -1) throw new Error(`в ответе нет JSON: ${text.slice(0, 200)}`);
  return JSON.parse(cleaned.slice(start, end + 1));
}

export async function classifyFacade(imageBase64) {
  // Мягкий rate limit: не чаще 1 запроса в GROQ_MIN_INTERVAL_MS (~15 RPM).
  const wait = GROQ_MIN_INTERVAL_MS - (Date.now() - lastCallAt);
  if (wait > 0) await sleep(wait);
  lastCallAt = Date.now();

  const body = {
    model: GROQ_MODEL,
    temperature: 0.1,
    max_completion_tokens: 2048,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      {
        role: 'user',
        content: [
          { type: 'text', text: 'Классифицируй фасад на фото. Только JSON по схеме.' },
          { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${imageBase64}` } },
        ],
      },
    ],
  };

  const data = await getJson(`${GROQ_API}/chat/completions`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${GROQ_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }, { retries: 5, label: 'groq' });

  const parsed = extractJson(data.choices?.[0]?.message?.content ?? '');

  const glassCategory = CATEGORY_SLUGS.includes(parsed.glass_category) ? parsed.glass_category : null;
  const glazingCoverage = clamp01(parsed.glazing_coverage);
  const confidence = clamp01(parsed.confidence);
  if (glassCategory === null || glazingCoverage === null || confidence === null) {
    throw new Error(`невалидный ответ модели: ${JSON.stringify(parsed).slice(0, 300)}`);
  }

  return {
    is_reflective: Boolean(parsed.is_reflective),
    glass_category: glassCategory,
    glazing_coverage: glazingCoverage,
    confidence,
    raw: parsed,
  };
}

export { GROQ_MODEL };
