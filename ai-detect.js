// ════════════════════════════════════════════════════════════════════════════
// LightMap — клиентский слой ИИ-кандидатов
// ════════════════════════════════════════════════════════════════════════════

const AI_DETECT_CONFIG = {
  endpoint: '/api/classify-buildings',
  idStart: 100000,
  dedupeRadiusM: 80,
  confidence: ['low', 'medium', 'high'],
};

function normalizeAiCandidate(raw, index) {
  if (!raw || !Number.isFinite(raw.lat) || !Number.isFinite(raw.lng) || !Number.isFinite(raw.baseLux) || !AI_DETECT_CONFIG.confidence.includes(raw.confidence)) return null;
  return {
    id: AI_DETECT_CONFIG.idStart + index,
    name: escapeHtml(raw.name || 'Здание'),
    name_en: escapeHtml(raw.name_en || raw.name || 'Building'),
    name_kk: escapeHtml(raw.name_kk || raw.name || 'Ғимарат'),
    address: escapeHtml(raw.address || 'Астана'),
    address_en: escapeHtml(raw.address_en || raw.address || 'Astana'),
    glass: escapeHtml(raw.glass || 'unknown'),
    glass_en: escapeHtml(raw.glass_en || raw.glass || 'unknown'),
    lat: raw.lat, lng: raw.lng, baseLux: raw.baseLux,
    orientation: Number.isFinite(raw.orientation) ? raw.orientation : 0,
    dangerTime: escapeHtml(raw.dangerTime || ''),
    source: 'ai', confidence: raw.confidence,
  };
}

function dedupeAiCandidates(candidates, existingBuildings) {
  const accepted = [];
  for (const candidate of candidates) {
    if (!candidate) continue;
    const duplicate = [...(existingBuildings || []), ...accepted].some(building =>
      Number.isFinite(building.lat) && Number.isFinite(building.lng) &&
      haversine(building.lat, building.lng, candidate.lat, candidate.lng) < AI_DETECT_CONFIG.dedupeRadiusM,
    );
    if (!duplicate) accepted.push(candidate);
  }
  return accepted;
}

async function fetchAiDetectedBuildings(existingBuildings) {
  try {
    const response = await fetch(AI_DETECT_CONFIG.endpoint);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const payload = await response.json();
    if (!Array.isArray(payload.buildings)) return [];
    return dedupeAiCandidates(payload.buildings.map(normalizeAiCandidate), existingBuildings);
  } catch (error) {
    console.warn('[AutoDetect] AI candidates unavailable:', error);
    return [];
  }
}
