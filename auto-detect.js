// ════════════════════════════════════════════════════════════════════════════
//  АВТООБНАРУЖЕНИЕ ОПАСНЫХ ЗДАНИЙ (OpenStreetMap + физика блика)
// ════════════════════════════════════════════════════════════════════════════
//
//  Проблема: buildings.json — это список зданий, добавленных вручную.
//  Этот файл решает другую задачу — САМ находит здания-кандидаты по всей
//  Астане и оценивает их опасность, используя:
//
//    • Overpass API (openstreetmap.org)  — бесплатно, без ключа, находит
//      здания по координатам, высоте и материалу фасада;
//    • ту же физику солнца/отражения, что уже используется в script.js
//      (высота солнца, ориентация фасада, погода);
//    • расстояние до ближайшей дороги — если здание далеко от проезжей
//      части, блик от него водителю не мешает.
//
//  ВАЖНО — что это НЕ ИИ в смысле "обученная модель": это детерминированный
//  геометрический + физический расчёт (эвристика). Никакого обучения на
//  данных нет, потому что у нас нет размеченного датасета "здесь точно был
//  блик" — а без него честная ML-модель невозможна. Зато весь расчёт
//  прозрачен, бесплатен и объясним, что для учебного проекта даже лучше.
//
//  ТОЧНОСТЬ: OSM редко указывает материал фасада (building:material), поэтому
//  отражательная способность — это ОЦЕНКА по высоте здания, а не измеренная
//  величина. Такие здания помечаются полем confidence:'estimated' и словом
//  "оценка" в описании стекла, чтобы не выглядеть как проверенные данные.
//
//  Если Overpass API недоступен (нет сети, сервис лёг, таймаут) — функция
//  просто возвращает пустой список. Основной сайт при этом продолжает
//  нормально работать со зданиями из buildings.json.
// ════════════════════════════════════════════════════════════════════════════

const AUTO_DETECT_CONFIG = {
  // Примерная застроенная территория Астаны (левый + правый берег)
  bbox: { south: 51.05, west: 71.28, north: 51.22, east: 71.58 },

  minHeightM: 20,          // ниже ~6-7 этажей блик редко достигает уровня глаз водителя
  maxRoadDistanceM: 150,   // дальше от дороги — водителю уже не мешает
  dedupeRadiusM: 80,       // не дублировать здания, уже выверенные вручную в buildings.json
  maxResults: 50,          // не перегружать карту и safe-route расчёт

  idStart: 100000,         // гарантированно не пересекается с ручными id из buildings.json

  overpassEndpoints: [
    'https://overpass-api.de/api/interpreter',
    'https://overpass.kumi.systems/api/interpreter',
  ],
  overpassTimeoutMs: 20000,

  cacheKey: 'lightmap_auto_buildings_v1',
  cacheTtlMs: 24 * 60 * 60 * 1000, // 24 часа — геометрия зданий почти не меняется,
                                    // и это бережно к бесплатному Overpass API
};

const ASTANA_UTC_OFFSET_MIN = 5 * 60; // Asia/Almaty — круглый год UTC+5, без перехода на летнее время

// Материалы фасада → визуальная подпись + примерный коэффициент отражения (0..1)
// Коэффициенты отражения солнечного света для разных материалов фасада
// (при оптимальных углах попадания — примерно 30-60° от нормали)
// Отсортированы по убыванию опасности (отражательной способности)
const MATERIAL_REFLECTIVITY = {
  // ═══ ЗЕРКАЛЬНОЕ И ВЫСОКООТРАЖАЮЩЕЕ СТЕКЛО (наиболее опасно)
  mirror:              0.92,  // специализированное зеркальное (reflective glazing)
  reflective:          0.85,  // reflective glass, сильно тонированное с напылением
  'glass:mirror':      0.92,
  'glass:reflective':  0.85,

  // ═══ ОБЫЧНОЕ И СЛЕГКА ТОНИРОВАННОЕ СТЕКЛО
  glass:               0.75,  // generic float glass
  'glass:clear':       0.75,
  'glass:tinted':      0.70,  // слегка затемнённое (вроде sun-control tint)
  'glass:blue':        0.65,  // синевато-тонированное, чуть меньше отражает
  'glass:green':       0.65,
  'glass:grey':        0.60,  // более темное — меньше отражает
  'glass:bronze':      0.60,

  // ═══ СТЕКЛО НИЗКОЙ ЭМИССИВНОСТИ (low-E / энергосберегающее)
  // Эти типы специально разработаны чтобы отражать инфракрасное
  // но видимый свет пропускают лучше → меньше видимого отражают
  'glass:lowemissivity': 0.45,
  'glass:low-e':         0.45,
  'glass:high-selective': 0.48, // "высокоселективное" из buildings.json
  'glass:energy':        0.45,

  // ═══ ЛАМИНИРОВАННОЕ И МНОГОСЛОЙНОЕ
  // Обычно чуть меньше отражает за счёт промежуточных слоёв
  laminated:           0.68,  // ламинированное
  'glass:laminated':   0.68,
  'glass:layered':     0.68,
  'glass:triple':      0.62,  // трёхслойное может быть с low-E обработкой

  // ═══ ПОЛУПРОЗРАЧНЫЕ МЕМБРАНЫ И СПЕЦИАЛЬНЫЕ КОНСТРУКЦИИ
  // (как "Трехслойная мембрана" из buildings.json)
  membrane:            0.55,
  'glass:membrane':    0.55,
  'glass:etched':      0.45,  // матовое — рассеивает свет, меньше направленного отражения
  'glass:frosted':     0.45,

  // ═══ МЕТАЛЛ И МЕТАЛЛИЗИРОВАННЫЕ ПАНЕЛИ
  metal:               0.65,
  'metal:aluminium':   0.70,
  'metal:steel':       0.60,
  'metal:copper':      0.65,
  'metal:zinc':        0.60,
  aluminium:           0.70,  // алюминий обычно полированный, хорошо отражает
  steel:               0.60,
  'composite:metal':   0.62,

  // ═══ КОМПОЗИТНЫЕ И МИНЕРАЛЬНЫЕ
  concrete:            0.35,  // бетон (если вообще остекления нет — это минимум)
  'composite:plastic': 0.50,
  'composite:cfrp':    0.55,  // углепластик — может блестеть
};

const MATERIAL_LABELS = {
  // Зеркальное и высокоотражающее
  mirror:              { ru: 'Зеркальное/отражающее стекло (данные OSM)',      en: 'Mirrored/reflective glass (OSM data)' },
  reflective:          { ru: 'Высокоотражающее стекло (данные OSM)',          en: 'Highly reflective glass (OSM data)' },
  'glass:mirror':      { ru: 'Зеркальное стекло (данные OSM)',                 en: 'Mirror glass (OSM data)' },
  'glass:reflective':  { ru: 'Отражающее стекло (данные OSM)',                 en: 'Reflective glass (OSM data)' },

  // Обычное стекло
  glass:               { ru: 'Стеклянный фасад (данные OSM)',                  en: 'Glass facade (OSM data)' },
  'glass:clear':       { ru: 'Прозрачное стекло (данные OSM)',                 en: 'Clear glass (OSM data)' },
  'glass:tinted':      { ru: 'Тонированное стекло (данные OSM)',               en: 'Tinted glass (OSM data)' },
  'glass:blue':        { ru: 'Синее тонированное стекло (данные OSM)',         en: 'Blue-tinted glass (OSM data)' },
  'glass:green':       { ru: 'Зелёное тонированное стекло (данные OSM)',       en: 'Green-tinted glass (OSM data)' },
  'glass:grey':        { ru: 'Серое тонированное стекло (данные OSM)',         en: 'Grey-tinted glass (OSM data)' },
  'glass:bronze':      { ru: 'Бронзовое тонированное стекло (данные OSM)',     en: 'Bronze-tinted glass (OSM data)' },

  // Энергосберегающее
  'glass:lowemissivity': { ru: 'Низкоэмиссионное стекло (данные OSM)',        en: 'Low-emissivity glass (OSM data)' },
  'glass:low-e':         { ru: 'Low-E стекло (данные OSM)',                    en: 'Low-E glass (OSM data)' },
  'glass:high-selective': { ru: 'Высокоселективное стекло (данные OSM)',       en: 'High-selective glass (OSM data)' },
  'glass:energy':        { ru: 'Энергосберегающее стекло (данные OSM)',        en: 'Energy-saving glass (OSM data)' },

  // Ламинированное
  laminated:           { ru: 'Ламинированное стекло (данные OSM)',             en: 'Laminated glass (OSM data)' },
  'glass:laminated':   { ru: 'Ламинированное стекло (данные OSM)',             en: 'Laminated glass (OSM data)' },
  'glass:layered':     { ru: 'Многослойное стекло (данные OSM)',               en: 'Layered glass (OSM data)' },
  'glass:triple':      { ru: 'Трёхслойное стекло (данные OSM)',                en: 'Triple-glazed glass (OSM data)' },

  // Мембраны и специальные
  membrane:            { ru: 'Полупрозрачная мембрана (данные OSM)',          en: 'Translucent membrane (OSM data)' },
  'glass:membrane':    { ru: 'Мембранный фасад (данные OSM)',                 en: 'Membrane facade (OSM data)' },
  'glass:etched':      { ru: 'Матовое травленое стекло (данные OSM)',          en: 'Etched glass (OSM data)' },
  'glass:frosted':     { ru: 'Матовое стекло (данные OSM)',                    en: 'Frosted glass (OSM data)' },

  // Металл
  metal:               { ru: 'Металлический фасад (данные OSM)',               en: 'Metal facade (OSM data)' },
  'metal:aluminium':   { ru: 'Алюминиевый фасад (данные OSM)',                 en: 'Aluminium facade (OSM data)' },
  'metal:steel':       { ru: 'Стальной фасад (данные OSM)',                    en: 'Steel facade (OSM data)' },
  'metal:copper':      { ru: 'Медный фасад (данные OSM)',                      en: 'Copper facade (OSM data)' },
  'metal:zinc':        { ru: 'Цинковый фасад (данные OSM)',                    en: 'Zinc facade (OSM data)' },
  aluminium:           { ru: 'Алюминиевый фасад (данные OSM)',                 en: 'Aluminium facade (OSM data)' },
  steel:               { ru: 'Стальной фасад (данные OSM)',                    en: 'Steel facade (OSM data)' },
  'composite:metal':   { ru: 'Композит с металлом (данные OSM)',               en: 'Metal composite (OSM data)' },

  // Прочие
  concrete:            { ru: 'Бетон, вероятно с остеклением (OSM)',            en: 'Concrete, likely glazed (OSM data)' },
  'composite:plastic': { ru: 'Пластиковый композит (данные OSM)',              en: 'Plastic composite (OSM data)' },
  'composite:cfrp':    { ru: 'Углепластик (данные OSM)',                       en: 'Carbon fiber composite (OSM data)' },
};
// Если материал не указан в OSM, используем консервативный коэффициент для
// "стеклянного здания" (так как большинство офисных башен остеклены)
const DEFAULT_REFLECTIVITY = 0.65;
const DEFAULT_MATERIAL_LABEL = {
  ru: 'Тип материала неизвестен — оценка по высоте здания',
  en: 'Material type unknown — estimated from height',
};


// ────────────────────────────────────────────────────────────────────────────
//  ГЕОМЕТРИЯ (работает с сырыми координатами OSM: { lat, lon })
// ────────────────────────────────────────────────────────────────────────────

function haversineDistanceMeters(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const rad = Math.PI / 180;
  const dLat = (lat2 - lat1) * rad;
  const dLon = (lon2 - lon1) * rad;
  const a = Math.sin(dLat / 2) ** 2 +
            Math.cos(lat1 * rad) * Math.cos(lat2 * rad) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function bearingDeg(p1, p2) {
  const rad = Math.PI / 180;
  const lat1 = p1.lat * rad, lat2 = p2.lat * rad;
  const dLon = (p2.lon - p1.lon) * rad;
  const y = Math.sin(dLon) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
  return (Math.atan2(y, x) / rad + 360) % 360;
}

function destinationPoint(lat, lon, bearingDegVal, distMeters) {
  const R = 6371000;
  const rad = Math.PI / 180;
  const brng = bearingDegVal * rad;
  const lat1 = lat * rad, lon1 = lon * rad;
  const lat2 = Math.asin(
    Math.sin(lat1) * Math.cos(distMeters / R) +
    Math.cos(lat1) * Math.sin(distMeters / R) * Math.cos(brng)
  );
  const lon2 = lon1 + Math.atan2(
    Math.sin(brng) * Math.sin(distMeters / R) * Math.cos(lat1),
    Math.cos(distMeters / R) - Math.sin(lat1) * Math.sin(lat2)
  );
  return { lat: lat2 / rad, lon: lon2 / rad };
}

// Точка ближе к A или к B? Возвращает расстояние от точки p до отрезка [a,b] в метрах.
// Локальная равнопромежуточная проекция с центром в p — на масштабе города (< 1 км) точна.
function pointToSegmentDistanceMeters(p, a, b) {
  const R = 6371000;
  const rad = Math.PI / 180;
  const cosRefLat = Math.cos(p.lat * rad);
  const toXY = (pt) => ({
    x: (pt.lon - p.lon) * rad * R * cosRefLat,
    y: (pt.lat - p.lat) * rad * R,
  });
  const A = toXY(a), B = toXY(b);
  const ABx = B.x - A.x, ABy = B.y - A.y;
  const lenSq = ABx * ABx + ABy * ABy;
  let t = lenSq > 0 ? (-A.x * ABx - A.y * ABy) / lenSq : 0;
  t = Math.max(0, Math.min(1, t));
  const cx = A.x + t * ABx, cy = A.y + t * ABy;
  return Math.sqrt(cx * cx + cy * cy);
}

// Убирает замыкающую точку кольца (первая === последняя, как в OSM way)
function ringPoints(geometry) {
  const pts = (geometry || [])
    .filter(pt => pt && typeof pt.lat === 'number' && typeof pt.lon === 'number')
    .map(pt => ({ lat: pt.lat, lon: pt.lon }));
  if (pts.length > 1) {
    const first = pts[0], last = pts[pts.length - 1];
    if (Math.abs(first.lat - last.lat) < 1e-9 && Math.abs(first.lon - last.lon) < 1e-9) {
      pts.pop();
    }
  }
  return pts;
}

// Центроид — среднее вершин полигона. Это приближение (не area-weighted
// центроид), но для прямоугольных/близких к выпуклым зданий разница
// пренебрежимо мала, а код при этом простой и надёжный.
function polygonCentroid(pts) {
  if (pts.length < 3) return null;
  let sumLat = 0, sumLon = 0;
  pts.forEach(p => { sumLat += p.lat; sumLon += p.lon; });
  return { lat: sumLat / pts.length, lon: sumLon / pts.length };
}

// Направление "наружу" от самой длинной стороны здания (вероятный главный
// фасад). Наружу — значит "дальше от центроида", это не зависит от того,
// в какую сторону обходятся точки полигона в данных OSM (CW или CCW).
function outwardNormalBearing(p1, p2, centroid) {
  const midLat = (p1.lat + p2.lat) / 2;
  const midLon = (p1.lon + p2.lon) / 2;
  const edgeBearing = bearingDeg(p1, p2);
  const normalA = (edgeBearing + 90) % 360;
  const normalB = (edgeBearing + 270) % 360;

  const probeDist = 5; // метров — достаточно, чтобы определить сторону
  const pA = destinationPoint(midLat, midLon, normalA, probeDist);
  const pB = destinationPoint(midLat, midLon, normalB, probeDist);

  const dA = haversineDistanceMeters(pA.lat, pA.lon, centroid.lat, centroid.lon);
  const dB = haversineDistanceMeters(pB.lat, pB.lon, centroid.lat, centroid.lon);

  return dA > dB ? normalA : normalB;
}

function estimateFacadeOrientation(pts, centroid) {
  if (pts.length < 2) return 0;
  let bestLen = -1, bestA = pts[0], bestB = pts[1 % pts.length];
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i];
    const b = pts[(i + 1) % pts.length];
    const len = haversineDistanceMeters(a.lat, a.lon, b.lat, b.lon);
    if (len > bestLen) {
      bestLen = len;
      bestA = a;
      bestB = b;
    }
  }
  return outwardNormalBearing(bestA, bestB, centroid);
}


// ────────────────────────────────────────────────────────────────────────────
//  ФИЗИКА: солнце + оценка люксов (та же модель, что и в script.js,
//  продублирована здесь намеренно — чтобы этот файл не зависел от порядка
//  подключения script.js и работал даже отдельно)
// ────────────────────────────────────────────────────────────────────────────

function sunPositionSimple(date, lat, lon) {
  const rad = Math.PI / 180;
  const dayOfYear = Math.floor((date - new Date(date.getFullYear(), 0, 0)) / 86400000);
  const declination = 23.45 * Math.sin(rad * (360 / 365) * (dayOfYear - 81));

  const hourUTC = date.getUTCHours() + date.getUTCMinutes() / 60;
  const solarNoon = 12 - lon / 15;
  const hourAngle = (hourUTC - solarNoon) * 15;

  const sinAlt = Math.sin(lat * rad) * Math.sin(declination * rad) +
                 Math.cos(lat * rad) * Math.cos(declination * rad) * Math.cos(hourAngle * rad);
  const clampedSinAlt = Math.max(-1, Math.min(1, sinAlt));
  const altitude = Math.asin(clampedSinAlt) / rad;

  const cosLatTerm = Math.cos(lat * rad) * Math.cos(Math.asin(clampedSinAlt));
  const cosAz = cosLatTerm !== 0
    ? (Math.sin(declination * rad) - Math.sin(lat * rad) * clampedSinAlt) / cosLatTerm
    : 1;
  let azimuth = Math.acos(Math.max(-1, Math.min(1, cosAz))) / rad;
  if (hourAngle > 0) azimuth = 360 - azimuth;

  return { altitude, azimuth };
}

function timeSunMultiplierSimple(orientation, altitude, azimuth) {
  if (altitude <= 0) return 0;

  let altMul;
  if (altitude < 5) altMul = 0.7;
  else if (altitude < 15) altMul = 1.0;
  else if (altitude < 30) altMul = 0.85;
  else if (altitude < 50) altMul = 0.5;
  else altMul = 0.25;

  if (orientation != null && orientation !== 0) {
    let angleDiff = Math.abs(azimuth - orientation);
    if (angleDiff > 180) angleDiff = 360 - angleDiff;

    let orientMul;
    if (angleDiff < 30) orientMul = 1.0;
    else if (angleDiff < 60) orientMul = 0.6;
    else if (angleDiff < 90) orientMul = 0.3;
    else orientMul = 0.1;

    altMul *= orientMul;
  }

  return altMul;
}

// Прогоняет сутки (05:00–21:00 по времени Астаны) и находит окна, где
// расчётная яркость при ясном небе превышает порог "предупреждения"
// (тот же порог 10000 лк, что использует levelOf() в script.js).
// Работает через UTC, поэтому результат не зависит от часового пояса
// браузера посетителя сайта.
function estimateDangerWindows(orientation, baseLux, lat, lon) {
  const now = new Date();
  const y = now.getUTCFullYear(), m = now.getUTCMonth(), d = now.getUTCDate();
  const threshold = 10000;

  const windows = [];
  let windowStart = null;

  for (let localMin = 5 * 60; localMin <= 21 * 60; localMin += 15) {
    const utcMin = localMin - ASTANA_UTC_OFFSET_MIN;
    const probe = new Date(Date.UTC(y, m, d, 0, utcMin, 0, 0));
    const sun = sunPositionSimple(probe, lat, lon);
    const mul = timeSunMultiplierSimple(orientation, sun.altitude, sun.azimuth);
    const lux = baseLux * mul;

    if (lux >= threshold) {
      if (windowStart === null) windowStart = localMin;
    } else if (windowStart !== null) {
      windows.push([windowStart, localMin - 15]);
      windowStart = null;
    }
  }
  if (windowStart !== null) windows.push([windowStart, 21 * 60]);

  const fmt = (min) => {
    const h = Math.floor(min / 60);
    const mm = min % 60;
    return `${String(h).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
  };

  const text = windows.map(([s, e]) => `${fmt(s)}–${fmt(e)}`).join(' ');
  const hasMorning = windows.some(([s]) => s < 12 * 60);
  const hasEvening = windows.some(([, e]) => e >= 12 * 60);
  let period = 'both';
  if (hasMorning && !hasEvening) period = 'morning';
  else if (!hasMorning && hasEvening) period = 'evening';

  return { windows, text, period };
}


// ────────────────────────────────────────────────────────────────────────────
//  ОЦЕНКА ВЫСОТЫ / МАТЕРИАЛА / БАЗОВОЙ ЯРКОСТИ
// ────────────────────────────────────────────────────────────────────────────

// Достаёт первое число из тега OSM (защита от значений вида "35;40" или "35 m")
function parseNumericTag(raw) {
  if (raw == null) return null;
  const match = String(raw).replace(',', '.').match(/-?\d+(\.\d+)?/);
  if (!match) return null;
  const val = parseFloat(match[0]);
  return isNaN(val) ? null : val;
}

function estimateHeightMeters(tags) {
  const h = parseNumericTag(tags.height);
  if (h && h > 0) return h;
  const levels = parseNumericTag(tags['building:levels']);
  if (levels && levels > 0) return levels * 3.2; // ~3.2 м на этаж для коммерческой недвижимости
  return null;
}

function normalizeMaterialTag(rawTag) {
  if (!rawTag) return null;
  const v = String(rawTag).toLowerCase().trim().replace(/\s+/g, '');

  // 1. Точное совпадение — вернуть как есть
  if (MATERIAL_REFLECTIVITY.hasOwnProperty(v)) return v;

  // 2. Парсинг составных тегов вида "glass:тип" или "metal:тип"
  const colonParts = v.split(':');
  if (colonParts.length === 2) {
    const [category, subtype] = colonParts;

    // glass:* — проверить специальные типы
    if (category === 'glass') {
      const glassKey = `glass:${subtype}`;
      if (MATERIAL_REFLECTIVITY.hasOwnProperty(glassKey)) return glassKey;

      // Эвристика для неточных совпадений
      if (subtype.includes('mirror')) return 'glass:mirror';
      if (subtype.includes('reflect')) return 'glass:reflective';
      if (subtype.includes('low') && subtype.includes('e')) return 'glass:low-e';
      if (subtype.includes('lowemiss')) return 'glass:lowemissivity';
      if (subtype.includes('highselective')) return 'glass:high-selective';
      if (subtype.includes('selective')) return 'glass:high-selective';
      if (subtype.includes('laminated')) return 'glass:laminated';
      if (subtype.includes('layered')) return 'glass:layered';
      if (subtype.includes('triple')) return 'glass:triple';
      if (subtype.includes('tint')) return 'glass:tinted';
      if (subtype.includes('blue')) return 'glass:blue';
      if (subtype.includes('green')) return 'glass:green';
      if (subtype.includes('grey') || subtype.includes('gray')) return 'glass:grey';
      if (subtype.includes('bronze')) return 'glass:bronze';
      if (subtype.includes('etch')) return 'glass:etched';
      if (subtype.includes('frost')) return 'glass:frosted';
      if (subtype.includes('membrane')) return 'glass:membrane';
      if (subtype.includes('clear')) return 'glass:clear';
      if (subtype.includes('energy')) return 'glass:energy';

      // Если специальный тип не распознан, возвращаем просто 'glass'
      return 'glass';
    }

    // metal:* — проверить специальные типы металла
    if (category === 'metal') {
      const metalKey = `metal:${subtype}`;
      if (MATERIAL_REFLECTIVITY.hasOwnProperty(metalKey)) return metalKey;
      if (subtype.includes('alumin')) return 'metal:aluminium';
      if (subtype.includes('steel')) return 'metal:steel';
      if (subtype.includes('copper')) return 'metal:copper';
      if (subtype.includes('zinc')) return 'metal:zinc';
      return 'metal';
    }

    // composite:* — проверить типы композитов
    if (category === 'composite') {
      const compKey = `composite:${subtype}`;
      if (MATERIAL_REFLECTIVITY.hasOwnProperty(compKey)) return compKey;
      if (subtype.includes('metal')) return 'composite:metal';
      if (subtype.includes('plastic')) return 'composite:plastic';
      if (subtype.includes('carbon') || subtype.includes('cfrp')) return 'composite:cfrp';
    }
  }

  // 3. Эвристика на основе substring-поиска (без двоеточия)
  // Порядок важен: специфичные типы перед общими
  if (v.includes('mirror')) return 'mirror';
  if (v.includes('reflective') || v.includes('reflect')) return 'reflective';

  if (v.includes('lowemissivity') || (v.includes('low') && v.includes('emiss'))) return 'glass:lowemissivity';
  if (v.includes('lowe') || v.includes('low-e')) return 'glass:low-e';
  if (v.includes('highselective') || v.includes('selective')) return 'glass:high-selective';
  if (v.includes('laminated')) return 'laminated';
  if (v.includes('membrane')) return 'membrane';

  if (v.includes('glass')) return 'glass';

  if (v.includes('alumin')) return 'aluminium';
  if (v.includes('steel')) return 'steel';
  if (v.includes('copper')) return 'metal:copper';
  if (v.includes('zinc')) return 'metal:zinc';
  if (v.includes('metal')) return 'metal';

  if (v.includes('concrete')) return 'concrete';
  if (v.includes('plastic')) return 'composite:plastic';
  if (v.includes('carbon') || v.includes('cfrp')) return 'composite:cfrp';

  return null;
}

// Грубая оценка максимальной яркости блика (лк) в тех же единицах и на том
// же порядке величин, что и ручные значения в buildings.json (~15 000–90 000).
//
// Логика:
//   - На Земле прямое солнечное излучение при ясном небе: ~1000 Вт/м² = ~100 000 лк
//   - Отражение по Френелю зависит от материала (0.35...0.92) и угла падения
//   - Для высоких зданий (45–150м) отражение попадает на большую площадь,
//     поэтому освещённость "пика" блика ниже, чем простая формула отражение×солнце
//   - heightFactor: низкие здания → концентрированный блик; высокие → рассеянный
function estimateBaseLux(heightM, reflectivity) {
  const BASE_SOLAR_ILLUMINANCE = 100000; // лк при ясном небе (прямое солнечное излучение)

  // heightFactor: чем выше здание, тем шире "пучок" отражённого света
  // Для малых высот (< 20м) коэффициент близок к 0.3
  // Для больших высот (> 100м) коэффициент близок к 0.9
  const heightFactor = Math.min(1.0, 0.3 + heightM / 200);

  // Оценка яркости блика (без учёта угла солнца и погоды)
  const raw = BASE_SOLAR_ILLUMINANCE * reflectivity * heightFactor;

  // Ограничиваем диапазон, чтобы не выходить за границы reasonable значений
  // Минимум (~15 000) — низкое здание из тёмного бетона; максимум (~95 000) — высокое зеркало
  return Math.round(Math.max(10000, Math.min(100000, raw)));
}


// ────────────────────────────────────────────────────────────────────────────
//  НАЗВАНИЕ / АДРЕС (из тегов OSM, без дополнительных запросов к геокодеру —
//  чтобы не расходовать бесплатную квоту MapTiler на десятки зданий сразу)
// ────────────────────────────────────────────────────────────────────────────

function buildFallbackName(tags, centroid) {
  if (tags['addr:street']) {
    return tags['addr:housenumber']
      ? `Здание, ${tags['addr:street']} ${tags['addr:housenumber']}`
      : `Здание на ул. ${tags['addr:street']}`;
  }
  return `Здание (${centroid.lat.toFixed(4)}, ${centroid.lon.toFixed(4)})`;
}

function buildAddress(tags, centroid, isEnglish) {
  const street = isEnglish ? (tags['addr:street:en'] || tags['addr:street']) : tags['addr:street'];
  const num = tags['addr:housenumber'];
  if (street && num) return isEnglish ? `${street} St. ${num}` : `ул. ${street} ${num}`;
  if (street) return isEnglish ? `${street} St.` : `ул. ${street}`;
  return isEnglish
    ? `Coordinates: ${centroid.lat.toFixed(4)}, ${centroid.lon.toFixed(4)}`
    : `Координаты: ${centroid.lat.toFixed(4)}, ${centroid.lon.toFixed(4)}`;
}


// ────────────────────────────────────────────────────────────────────────────
//  OVERPASS API
// ────────────────────────────────────────────────────────────────────────────

function overpassBboxString() {
  const { south, west, north, east } = AUTO_DETECT_CONFIG.bbox;
  return `${south},${west},${north},${east}`;
}

async function queryOverpass(query) {
  let lastErr = null;
  for (const endpoint of AUTO_DETECT_CONFIG.overpassEndpoints) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), AUTO_DETECT_CONFIG.overpassTimeoutMs);
    try {
      const resp = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'data=' + encodeURIComponent(query),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      if (!resp.ok) throw new Error(`Overpass HTTP ${resp.status}`);
      const json = await resp.json();
      if (!json || !Array.isArray(json.elements)) throw new Error('Overpass: неожиданный формат ответа');
      return json.elements;
    } catch (err) {
      clearTimeout(timeoutId);
      console.warn(`[AutoDetect] Overpass endpoint недоступен (${endpoint}):`, err);
      lastErr = err;
    }
  }
  throw lastErr || new Error('Все Overpass-эндпоинты недоступны');
}

async function fetchBuildingWays() {
  const bbox = overpassBboxString();
  const query = `
    [out:json][timeout:25];
    (
      way["building"]["height"](${bbox});
      way["building"]["building:levels"](${bbox});
    );
    out geom;
  `;
  return queryOverpass(query);
}

async function fetchRoadWays() {
  const bbox = overpassBboxString();
  const query = `
    [out:json][timeout:25];
    way["highway"~"^(trunk|primary|secondary|tertiary|residential|living_street|unclassified|trunk_link|primary_link|secondary_link|tertiary_link)$"](${bbox});
    out geom;
  `;
  return queryOverpass(query);
}

// Минимальное расстояние (м) от точки до ближайшей дороги из набора way
function minDistanceToRoads(point, roadWays) {
  let min = Infinity;
  const pad = 0.01; // ~1 км в градусах — грубая, но дешёвая предварительная отсечка

  for (const way of roadWays) {
    if (!way.geometry || way.geometry.length < 2) continue;

    if (way.bounds) {
      const b = way.bounds;
      if (point.lat < b.minlat - pad || point.lat > b.maxlat + pad ||
          point.lon < b.minlon - pad || point.lon > b.maxlon + pad) {
        continue;
      }
    }

    const ring = way.geometry;
    for (let i = 1; i < ring.length; i++) {
      const a = ring[i - 1], c = ring[i];
      if (!a || !c || typeof a.lat !== 'number' || typeof c.lat !== 'number') continue;
      const d = pointToSegmentDistanceMeters(point, { lat: a.lat, lon: a.lon }, { lat: c.lat, lon: c.lon });
      if (d < min) min = d;
    }

    if (min < 1) break; // практически на дороге — точнее уже не нужно
  }

  return isFinite(min) ? min : null;
}


// ────────────────────────────────────────────────────────────────────────────
//  КЭШ (localStorage) — чтобы не дёргать бесплатный Overpass API при каждом
//  открытии сайта. dangerTime/period в кэш не кладём — они пересчитываются
//  заново при каждой загрузке (это быстро и не требует сети).
// ────────────────────────────────────────────────────────────────────────────

function readCache() {
  try {
    const raw = localStorage.getItem(AUTO_DETECT_CONFIG.cacheKey);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.data) || typeof parsed.ts !== 'number') return null;
    if (Date.now() - parsed.ts > AUTO_DETECT_CONFIG.cacheTtlMs) return null;
    return parsed.data;
  } catch (err) {
    console.warn('[AutoDetect] Кэш недоступен для чтения:', err);
    return null;
  }
}

function writeCache(data) {
  try {
    localStorage.setItem(AUTO_DETECT_CONFIG.cacheKey, JSON.stringify({ ts: Date.now(), data }));
  } catch (err) {
    console.warn('[AutoDetect] Кэш недоступен для записи:', err);
  }
}


// ────────────────────────────────────────────────────────────────────────────
//  ОСНОВНАЯ ЛОГИКА
// ────────────────────────────────────────────────────────────────────────────

// Строит "сырых" кандидатов (без dangerTime/period) из ответа Overpass.
async function buildRawCandidates() {
  const [buildingWays, roadWays] = await Promise.all([
    fetchBuildingWays(),
    fetchRoadWays(),
  ]);

  const candidates = [];
  let autoId = AUTO_DETECT_CONFIG.idStart;

  for (const way of buildingWays) {
    const tags = way.tags || {};

    const heightM = estimateHeightMeters(tags);
    if (!heightM || heightM < AUTO_DETECT_CONFIG.minHeightM) continue;

    const pts = ringPoints(way.geometry);
    if (pts.length < 3) continue;

    const centroid = polygonCentroid(pts);
    if (!centroid) continue;

    const roadDist = minDistanceToRoads(centroid, roadWays);
    if (roadDist == null || roadDist > AUTO_DETECT_CONFIG.maxRoadDistanceM) continue;

    const orientation = estimateFacadeOrientation(pts, centroid);
    const materialKey = normalizeMaterialTag(tags['building:material']);
    const reflectivity = MATERIAL_REFLECTIVITY[materialKey] ?? DEFAULT_REFLECTIVITY;
    const baseLux = estimateBaseLux(heightM, reflectivity);
    const materialLabel = MATERIAL_LABELS[materialKey] || DEFAULT_MATERIAL_LABEL;

    const name = tags.name || buildFallbackName(tags, centroid);
    const nameEn = tags['name:en'] || name;
    const nameKk = tags['name:kk'] || null;

    const candidate = {
      id: autoId++,
      name,
      name_en: nameEn,
      address: buildAddress(tags, centroid, false),
      address_en: buildAddress(tags, centroid, true),
      lat: centroid.lat,
      lng: centroid.lon,
      baseLux,
      glass: materialLabel.ru,
      glass_en: materialLabel.en,
      orientation,
      source: 'auto',           // служебное поле, не используется в отрисовке
      confidence: 'estimated',  // служебное поле, не используется в отрисовке
    };
    if (nameKk) candidate.name_kk = nameKk;

    candidates.push(candidate);
  }

  return candidates;
}

function dedupeAgainstManual(candidates, manualList) {
  if (!Array.isArray(manualList) || manualList.length === 0) return candidates;
  return candidates.filter(c => !manualList.some(b =>
    typeof b.lat === 'number' && typeof b.lng === 'number' &&
    haversineDistanceMeters(b.lat, b.lng, c.lat, c.lng) < AUTO_DETECT_CONFIG.dedupeRadiusM
  ));
}

// Публичная точка входа. Вызывается из script.js после загрузки buildings.json.
// existingBuildings — уже загруженный ручной список (для дедупликации).
// Никогда не бросает исключение наружу без явного try/catch в вызывающем коде
// не требуется — все сетевые ошибки перехватываются внутри и приводят к [].
async function autoDetectBuildings(existingBuildings) {
  let rawCandidates;

  const cached = readCache();
  if (cached) {
    rawCandidates = cached;
  } else {
    rawCandidates = await buildRawCandidates();
    writeCache(rawCandidates);
  }

  const deduped = dedupeAgainstManual(rawCandidates, existingBuildings || []);

  const finalCandidates = deduped
    .map(c => {
      const forecast = estimateDangerWindows(c.orientation, c.baseLux, c.lat, c.lng);
      if (forecast.windows.length === 0) return null; // за сутки нет ни одного опасного окна
      return { ...c, dangerTime: forecast.text, period: forecast.period };
    })
    .filter(Boolean)
    .sort((a, b) => b.baseLux - a.baseLux)
    .slice(0, AUTO_DETECT_CONFIG.maxResults);

  return finalCandidates;
}
