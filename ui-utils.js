function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function getLocalizedBuildingField(building, field, lang, fallback = '') {
  if (!building) return fallback;
  if (lang === 'en') return building[`${field}_en`] || building[field] || fallback;
  if (lang === 'kk') return building[`${field}_kk`] || building[field] || fallback;
  return building[field] || fallback;
}
