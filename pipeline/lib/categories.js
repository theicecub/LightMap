// Категории стекла: единый enum для Groq, RU/EN строки для buildings.json
// и маппинг свободных текстов текущих 29 записей (для калибровки baseLux).

export const GLASS_CATEGORIES = {
  mirror:           { ru: 'Зеркальное архитектурное стекло', en: 'Mirrored architectural glass' },
  high_selective:   { ru: 'Высокоселективное стекло',         en: 'High-selective glass' },
  low_e_panoramic:  { ru: 'Панорамное остекление, Low-E стеклопакеты', en: 'Panoramic glazing, Low-E double-glazed units' },
  tinted:           { ru: 'Тонированное стекло',              en: 'Tinted glass' },
  laminated:        { ru: 'Ламинированное стекло',            en: 'Laminated glass' },
  curtain_wall:     { ru: 'Стеклянный навесной фасад',        en: 'Glass curtain wall' },
  not_glass:        { ru: 'Не стекло',                        en: 'Not glass' },
};

export const CATEGORY_SLUGS = Object.keys(GLASS_CATEGORIES);

// Свободные glass-строки из текущего buildings.json → slug категории.
// Используется ТОЛЬКО калибровкой baseLux; существующие записи не меняются.
export function mapFreeTextGlass(text) {
  const t = text.toLowerCase();
  if (t.includes('зеркальн')) return 'mirror';
  if (t.includes('высокоселективн')) return 'high_selective';
  if (t.includes('low-e') || t.includes('low-e') || t.includes('структурн')) return 'low_e_panoramic';
  if (t.includes('тонирован')) return 'tinted';
  if (t.includes('ламинирован')) return 'laminated';
  if (t.includes('стекл') || t.includes('витраж') || t.includes('мембран') || t.includes('панорамн')) return 'curtain_wall';
  return null;
}
