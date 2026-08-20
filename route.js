// ════════════════════════════════════════════════════════════════════════════
// LightMap — Safe Route Module (Безопасный маршрут)
// Geocoding → Routing → Risk Scoring → Visualization
// ════════════════════════════════════════════════════════════════════════════

const ROUTE_I18N = {
  ru: {
    safeRoute: 'Безопасный маршрут',
    pointA: 'Точка А',
    pointB: 'Точка Б',
    placeholderA: 'Откуда',
    placeholderB: 'Куда',
    buildRoute: 'Построить маршрут',
    clearRoute: 'Очистить',
    clickMapA: 'Кликните по карте для точки А',
    clickMapB: 'Кликните по карте для точки Б',
    pickOnMap: '📍',
    routeDistance: 'Дистанция',
    routeDuration: 'Время в пути',
    dangerZones: 'Опасных зон',
    riskScore: 'Риск-скор',
    riskLevel: 'Уровень риска',
    riskSafe: 'Безопасно',
    riskMedium: 'Средняя опасность',
    riskDanger: 'Опасно',
    visibilityLow: 'Низкий',
    visibilityMedium: 'Средний',
    visibilityHigh: 'Высокий',
    normalRoute: 'Обычный маршрут',
    safeRouteLabel: 'Безопасный маршрут',
    comparison: 'Сравнение маршрутов',
    noRoute: 'Маршрут не найден',
    geocodingError: 'Ошибка геокодинга',
    routeError: 'Ошибка построения маршрута',
    noAlternatives: 'Альтернативных маршрутов нет',
    segmentDanger: 'Опасный участок',
    segmentWarning: 'Внимание',
    segmentSafe: 'Безопасно',
    blindingBuilding: 'Слепящее здание',
    reason: 'Причина',
    luxAtBuilding: 'Освещённость здания',
    exposureTime: 'Время воздействия',
    visibilityCoef: 'Коэффициент видимости',
    directionMatch: 'Направление движения совпадает с направлением на солнце',
    nearbyBuilding: 'Ближайшее здание',
    distance: 'Расстояние до маршрута',
    meters: 'м',
    minutes: 'мин',
    km: 'км',
    loading: 'Расчёт…',
    bestRoute: 'Рекомендуемый маршрут',
    routeAlt: 'Альтернатива',
    sunDirection: 'Направление на солнце',
    movementDirection: 'Направление движения',
    angleDiff: 'Угол расхождения',
    showDetails: 'Подробнее',
    hideDetails: 'Скрыть',
    noRiskZones: 'Опасных зон не обнаружено',
    routeSafe: 'Маршрут безопасен',
    routeHasRisks: 'На маршруте есть риски',
    eta: 'Прибытие',
    around: 'ок.',
    alternativesCount: 'Найдено маршрутов',
    selectRoute: 'Выбрать',
    useCurrentLocation: 'Текущая геопозиция',
    currentLocation: 'Текущая геопозиция',
    locationUnavailable: 'Не удалось получить геопозицию. Проверьте разрешение браузера.',
    locationDenied: 'Доступ к геопозиции запрещён.',
    locationAccuracyPoor: 'Не удалось определить позицию с достаточной точностью. Включите GPS и попробуйте ещё раз.',
    inDangerZone: 'Вы на опасном участке маршрута. Возможны ослепляющие блики.',
    inWarningZone: 'Вы на участке маршрута с повышенным риском. Будьте внимательны.',
    luxUnit: 'лк',
    locale: 'ru-RU',
  },
  en: {
    safeRoute: 'Safe Route',
    pointA: 'Point A',
    pointB: 'Point B',
    placeholderA: 'From',
    placeholderB: 'To',
    buildRoute: 'Build route',
    clearRoute: 'Clear',
    clickMapA: 'Click map for point A',
    clickMapB: 'Click map for point B',
    pickOnMap: '📍',
    routeDistance: 'Distance',
    routeDuration: 'Travel time',
    dangerZones: 'Danger zones',
    riskScore: 'Risk score',
    riskLevel: 'Risk level',
    riskSafe: 'Safe',
    riskMedium: 'Moderate Risk',
    riskDanger: 'Danger',
    visibilityLow: 'Low',
    visibilityMedium: 'Moderate',
    visibilityHigh: 'High',
    normalRoute: 'Normal route',
    safeRouteLabel: 'Safe route',
    comparison: 'Route comparison',
    noRoute: 'No route found',
    geocodingError: 'Geocoding error',
    routeError: 'Routing error',
    noAlternatives: 'No alternative routes',
    segmentDanger: 'Dangerous segment',
    segmentWarning: 'Caution',
    segmentSafe: 'Safe',
    blindingBuilding: 'Blinding building',
    reason: 'Reason',
    luxAtBuilding: 'Building illuminance',
    exposureTime: 'Exposure time',
    visibilityCoef: 'Visibility coefficient',
    directionMatch: 'Movement direction matches sun direction',
    nearbyBuilding: 'Nearest building',
    distance: 'Distance to route',
    meters: 'm',
    minutes: 'min',
    km: 'km',
    loading: 'Calculating…',
    bestRoute: 'Recommended route',
    routeAlt: 'Alternative',
    sunDirection: 'Sun direction',
    movementDirection: 'Movement direction',
    angleDiff: 'Angle difference',
    showDetails: 'Details',
    hideDetails: 'Hide',
    noRiskZones: 'No danger zones detected',
    routeSafe: 'Route is safe',
    routeHasRisks: 'Route has risks',
    eta: 'Arrival',
    around: '~',
    alternativesCount: 'Routes found',
    selectRoute: 'Select',
    useCurrentLocation: 'Current location',
    currentLocation: 'Current location',
    locationUnavailable: 'Could not get your location. Check browser permissions.',
    locationDenied: 'Location access was denied.',
    locationAccuracyPoor: 'Your location is not accurate enough. Enable GPS and try again.',
    inDangerZone: 'You are on a dangerous route segment. Glare may affect visibility.',
    inWarningZone: 'You are on a higher-risk route segment. Please stay alert.',
    luxUnit: 'lx',
    locale: 'en-US',
  },
  kk: {
    safeRoute: 'Қауіпсіз маршрут',
    pointA: 'А нүктесі',
    pointB: 'Б нүктесі',
    placeholderA: 'Қайдан',
    placeholderB: 'Қайда',
    buildRoute: 'Маршрут құру',
    clearRoute: 'Жою',
    clickMapA: 'А нүктесін таңдау үшін картадан басыңыз',
    clickMapB: 'Б нүктесін таңдау үшін картадан басыңыз',
    pickOnMap: '📍',
    routeDistance: 'Маршрут ұзындығы',
    routeDuration: 'Жол жүру уақыты',
    dangerZones: 'Қауіпті аймақтар',
    riskScore: 'Қауіп-скоры',
    riskLevel: 'Қауіп деңгейі',
    riskSafe: 'Қауіпсіз',
    riskMedium: 'Орташа қауіп',
    riskDanger: 'Қауіпті',
    visibilityLow: 'Төмен',
    visibilityMedium: 'Орташа',
    visibilityHigh: 'Жоғары',
    normalRoute: 'Қалыпты маршрут',
    safeRouteLabel: 'Қауіпсіз маршрут',
    comparison: 'Маршруттарды салыстыру',
    noRoute: 'Маршрут табылмады',
    geocodingError: 'Геокодтау қатесі',
    routeError: 'Маршрутты құру қатесі',
    noAlternatives: 'Балама маршруттар жоқ',
    segmentDanger: 'Қауіпті аймақ',
    segmentWarning: 'Ескерту',
    segmentSafe: 'Қауіпсіз',
    blindingBuilding: 'Көз шағылдыратын ғимарат',
    reason: 'Себебі',
    luxAtBuilding: 'Ғимараттың жарықтануы',
    exposureTime: 'Әсер ету уақыты',
    visibilityCoef: 'Көріну коэффициенті',
    directionMatch: 'Қозғалыс бағыты күн бағытымен сәйкес келеді',
    nearbyBuilding: 'Ең жақын ғимарат',
    distance: 'Маршрутқа дейінгі қашықтық',
    meters: 'м',
    minutes: 'мин',
    km: 'км',
    loading: 'Есептелуде…',
    bestRoute: 'Ұсынылатын маршрут',
    routeAlt: 'Баламa маршрут',
    sunDirection: 'Күн бағыты',
    movementDirection: 'Қозғалыс бағыты',
    angleDiff: 'Бұрыш айырмашылығы',
    showDetails: 'Толығырақ',
    hideDetails: 'Жасыру',
    noRiskZones: 'Қауіпті аймақтар анықталған жоқ',
    routeSafe: 'Маршрут қауіпсіз',
    routeHasRisks: 'Маршрутта қауіптер бар',
    eta: 'Келу уақыты',
    around: 'шамамен',
    alternativesCount: 'Табылған маршруттар',
    selectRoute: 'Таңдау',
    useCurrentLocation: 'Ағымдағы геолокация',
    currentLocation: 'Ағымдағы геолокация',
    locationUnavailable: 'Геолокацияны алу мүмкін болмады. Браузер рұқсатын тексеріңіз.',
    locationDenied: 'Геолокацияға рұқсат берілмеді.',
    locationAccuracyPoor: 'Орналасу дәлдігі жеткіліксіз. GPS-ті қосып, қайталап көріңіз.',
    inDangerZone: 'Сіз маршруттың қауіпті бөлігінде тұрсыз. Көз шағылыстыруы мүмкін.',
    inWarningZone: 'Сіз маршруттың тәуекелі жоғары бөлігінде тұрсыз. Абай болыңыз.',
    luxUnit: 'лк',
    locale: 'kk-KZ',
  },
};

function rt(key) {
  const val = ROUTE_I18N[currentLang]?.[key];
  return val !== undefined ? val : key;
}

function getRiskText(level) {
  if (level === 'danger') return rt('riskDanger');
  if (level === 'warning') return rt('riskMedium');
  return rt('riskSafe');
}

function getVisibilityText(value) {
  if (value >= 0.7) return { label: rt('visibilityHigh'), level: 'danger' };
  if (value >= 0.3) return { label: rt('visibilityMedium'), level: 'warning' };
  return { label: rt('visibilityLow'), level: 'safe' };
}

function getRouteRiskStatus(route) {
  if (!route) return { label: rt('riskSafe'), level: 'safe' };
  if (route.dangerZoneCount > 0 || route.totalRiskScore > 20000) {
    return { label: rt('riskDanger'), level: 'danger' };
  }
  if (route.warningZoneCount > 0 || route.totalRiskScore > 5000) {
    return { label: rt('riskMedium'), level: 'warning' };
  }
  return { label: rt('riskSafe'), level: 'safe' };
}

// ════════════════════════════════════════════════════════════════════════════
// CONFIG
// ════════════════════════════════════════════════════════════════════════════

const ROUTE_CONFIG = {
  suggestUrl: '/api/suggest',
  placesUrl: './places.json',
  directionsUrl: `https://router.project-osrm.org/route/v1/driving`,
  debounceMs: 350,
  proximity: [71.430, 51.128], // Astana center — bias geocoding results
  // Astana bounding box [west, south, east, north] — hard-restrict geocoding to city only
  cityBbox: [71.10, 50.95, 71.80, 51.30],
  searchRadius: 300,           // meters — building proximity to route
  dangerLuxThreshold: 50000,   // lux — above this is considered dangerous
  sunAngleTolerance: 30,       // degrees — movement vs sun direction ±
  segmentChunkSize: 100,       // meters — chunk route into segments for coloring
  maxSuggestions: 6,
  cacheTTL: 5 * 60 * 1000,     // 5 min geocoding cache
  detourOffsets: [450, -450, 850, -850], // meters — perpendicular detours to synthesize alternatives
  maxAlternatives: 3,          // max routes to present (including the main one)
  locationRouteUpdateDistance: 25, // meters before rebuilding from a new position
  locationRouteUpdateInterval: 7000, // avoid excessive routing requests while moving
  locationZoneRadius: 35, // meters around a colored route segment
  locationMaxAccuracy: 200, // ignore coarse IP/Wi-Fi fixes that shift the route
  locationMaxSpeed: 55, // m/s — rejects implausible GPS jumps between updates
};

// ════════════════════════════════════════════════════════════════════════════
// STATE
// ════════════════════════════════════════════════════════════════════════════

const routeState = {
  pointA: null,  // { lng, lat, label }
  pointB: null,
  pickingFor: null,  // 'A' | 'B' | null
  routes: [],        // array of evaluated route objects
  selectedRouteIdx: 0,
  active: false,
  loading: false,
  userPosition: null,
  userMarker: null,
  geoWatchId: null,
  followsUserLocation: false,
  lastRouteOrigin: null,
  lastLocationRouteUpdateAt: 0,
  currentZoneLevel: null,
  buildRequestId: 0,
  lastPositionTimestamp: 0,
};

// Geocoding cache: query → { results, timestamp }
const geocodeCache = new Map();

// Local places database
let localPlaces = [];

// MapTiler stores some streets under their full official name.  In everyday
// input users often omit the first name, so keep known aliases in one form
// before both local and remote search.
function normalizeSearchText(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/(?:шакарим[а]?\s+)?куда[йи]берд[иы]ул[ыы]|ш(?:а|ә)кәрім\s+құдайбердіұлы/giu, 'шакарим кудайбердыулы')
    .replace(/[.,]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function getRequestedHouseNumber(query) {
  const match = normalizeSearchText(query).match(/(?:^|\s)(\d+(?:\s*\/\s*\d+)?[\p{L}]?)(?=$|\s)/u);
  return match ? match[1].replace(/\s+/g, '') : null;
}

function isAddressQuery(query) {
  // A POI such as "поликлиника 7" also has a number, but it must not be
  // treated as a house number when querying the geocoder.
  return Boolean(getRequestedHouseNumber(query)) &&
    !/(?:^|[^\p{L}])(поликлиник|емхана|clinic|школ|school|больниц|hospital)/iu.test(query);
}

function hasRequestedHouseNumber(feature, houseNumber) {
  if (!houseNumber) return true;

  const escaped = houseNumber.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const candidate = [feature.text, feature.address, feature.place_name].filter(Boolean).join(' ');
  const exactHouseNumber = new RegExp(`(?:^|[^\\p{L}\\p{N}])${escaped}(?=$|[^\\p{L}\\p{N}/])`, 'iu');
  return exactHouseNumber.test(candidate);
}

// ════════════════════════════════════════════════════════════════════════════
// LOAD LOCAL PLACES
// ════════════════════════════════════════════════════════════════════════════

async function loadLocalPlaces() {
  try {
    const resp = await fetch(ROUTE_CONFIG.placesUrl);
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const data = await resp.json();
    localPlaces = data.places || [];
    console.log('[Places] Loaded', localPlaces.length, 'places');
  } catch (err) {
    console.warn('[Places] Could not load places.json:', err);
    localPlaces = [];
  }
}

// ════════════════════════════════════════════════════════════════════════════
// GEOCODING — 2GIS Suggest API with debounce + cache
// ════════════════════════════════════════════════════════════════════════════

function expandGeocodeQueries(query) {
  const normalized = normalizeSearchText(query);
  const original = query.toLowerCase().trim();
  return !normalized || normalized === original ? [query] : [query, normalized];
}

function getPlaceSearchFields(place) {
  return [
    place.name_ru,
    place.name_en,
    place.name_kk,
    place.address_ru,
    place.address_en,
    place.address_kk,
    ...(place.search_terms || []),
  ].filter(Boolean);
}

function searchLocalPlaces(query) {
  const q = normalizeSearchText(query);
  if (q.length < 2) return [];

  const qWords = q.split(' ').filter(Boolean);
  const houseNumber = isAddressQuery(query) ? getRequestedHouseNumber(query) : null;

  const scored = [];
  for (const place of localPlaces) {
    const nameFields = [place.name_ru, place.name_en, place.name_kk].filter(Boolean).map(normalizeSearchText);
    const addressFields = [place.address_ru, place.address_en, place.address_kk].filter(Boolean).map(normalizeSearchText);
    const allFields = getPlaceSearchFields(place).map(normalizeSearchText);

    const nameBlob = nameFields.join(' ');
    const addressBlob = addressFields.join(' ');
    const allBlob = allFields.join(' ');

    const exactAll = allBlob === q;
    const exactAddress = addressBlob === q;
    const containsAll = allBlob.includes(q);
    const containsAddress = addressBlob.includes(q);
    const containsName = nameBlob.includes(q);
    const wordsAll = qWords.length > 1 && qWords.every(word => allBlob.includes(word));
    const wordsAddress = qWords.length > 1 && qWords.every(word => addressBlob.includes(word));
    const wordsName = qWords.length > 1 && qWords.every(word => nameBlob.includes(word));

    if (!exactAll && !exactAddress && !containsAll && !containsAddress && !containsName && !wordsAll && !wordsAddress && !wordsName) {
      continue;
    }

    let score = 0;
    if (exactAll) score = 1000;
    else if (exactAddress) score = 980;
    else if (containsAddress) score = 900;
    else if (containsAll) score = 800;
    else if (wordsAddress) score = 700;
    else if (wordsAll) score = 600;
    else if (containsName) score = 500;
    else if (wordsName) score = 400;

    if (houseNumber) {
      const addressHasNumber = addressFields.some(field =>
        hasRequestedHouseNumber({ text: field, address: field, place_name: field }, houseNumber)
      );
      const nameHasNumber = nameFields.some(field =>
        hasRequestedHouseNumber({ text: field, address: field, place_name: field }, houseNumber)
      );

      if (addressHasNumber) {
        score += 250;
      } else if (nameHasNumber) {
        score += 100;
      } else {
        score -= 150;
      }
    }

    scored.push({
      score,
      lng: place.lng,
      lat: place.lat,
      label: currentLang === 'en' ? place.address_en : currentLang === 'kk' ? place.address_kk : place.address_ru,
      place: currentLang === 'en' ? (place.name_en + ', ' + place.address_en) :
             currentLang === 'kk' ? (place.name_kk + ', ' + place.address_kk) :
             (place.name_ru + ', ' + place.address_ru),
    });
  }

  scored.sort((a, b) => b.score - a.score);
  return scored.map(({ score, ...result }) => result);
}

function getGeocodeCacheKey(query) {
  return `${currentLang}:${query.toLowerCase()}`;
}

function getCachedGeocode(query) {
  const cached = geocodeCache.get(getGeocodeCacheKey(query));
  if (cached && Date.now() - cached.timestamp < ROUTE_CONFIG.cacheTTL) {
    return cached.results;
  }
  return null;
}

function setCachedGeocode(query, results) {
  geocodeCache.set(getGeocodeCacheKey(query), { results, timestamp: Date.now() });
}

function get2GisLocale() {
  if (currentLang === 'kk') return 'kk_KZ';
  return 'ru_KZ';
}

function getAstanaPolygon() {
  const [west, south, east, north] = ROUTE_CONFIG.cityBbox;
  return `POLYGON((${west} ${south},${east} ${south},${east} ${north},${west} ${north},${west} ${south}))`;
}

async function geocodeSearch(query) {
  const trimmed = query.trim();
  if (trimmed.length < 2) return [];

  const cached = getCachedGeocode(trimmed);
  if (cached) return cached;

  const houseNumber = isAddressQuery(trimmed) ? getRequestedHouseNumber(trimmed) : null;
  const addressSearch = Boolean(houseNumber);

  try {
    // `suggestUrl` is a same-origin relative path. `new URL()` needs an
    // explicit base for relative paths; without it the browser throws before
    // `fetch` is reached and every search is treated as an empty result.
    const url = new URL(ROUTE_CONFIG.suggestUrl, window.location.origin);
    url.searchParams.set('q', trimmed);
    url.searchParams.set('locale', get2GisLocale());
    // Address hints only contain a street and house number. For a name such as
    // "Керуен", request route endpoints instead: 2GIS returns the actual
    // building/organization name together with coordinates.
    url.searchParams.set('suggest_type', addressSearch ? 'address' : 'route_endpoint');
    if (addressSearch) url.searchParams.set('type', 'building');
    url.searchParams.set('fields', 'items.point,items.address,items.full_address_name');
    url.searchParams.set('location', ROUTE_CONFIG.proximity.join(','));
    url.searchParams.set('sort_point', ROUTE_CONFIG.proximity.join(','));
    url.searchParams.set('polygon', getAstanaPolygon());
    url.searchParams.set('page_size', ROUTE_CONFIG.maxSuggestions);

    const resp = await fetch(url);
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const data = await resp.json();
    const [west, south, east, north] = ROUTE_CONFIG.cityBbox;

    const results = (data.result?.items || [])
      .map(item => {
        const address = item.full_address_name || item.address_name || item.address?.name || '';
        const name = item.name || item.full_name || '';
        const label = addressSearch ? (address || name) : (name || address);
        return {
          lng: item.point?.lon,
          lat: item.point?.lat,
          label,
          place: label,
          item,
        };
      })
      .filter(r => Number.isFinite(r.lng) && Number.isFinite(r.lat))
      .filter(r => r.lng >= west && r.lng <= east && r.lat >= south && r.lat <= north)
      .filter(r => !houseNumber || hasRequestedHouseNumber({
        text: r.item.name,
        address: r.item.address_name || r.item.address?.name,
        place_name: r.label,
      }, houseNumber))
      .map(({ item, ...result }) => result);

    setCachedGeocode(trimmed, results);
    return results;
  } catch (err) {
    console.warn('[2GIS Suggest] Search failed:', err);
    setCachedGeocode(trimmed, []);
    return [];
  }
}

// ════════════════════════════════════════════════════════════════════════════
// ROUTING — MapTiler Directions API with alternatives
// ════════════════════════════════════════════════════════════════════════════

// Request a single OSRM route through an ordered list of {lng, lat} waypoints
async function fetchOsrmRoute(waypoints) {
  const coords = waypoints.map(p => `${p.lng},${p.lat}`).join(';');
  const url = `${ROUTE_CONFIG.directionsUrl}/${coords}` +
    `?alternatives=true` +
    `&steps=true` +
    `&geometries=geojson` +
    `&overview=full`;

  try {
    const resp = await fetch(url);
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const data = await resp.json();
    if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) return [];
    return data.routes;
  } catch (err) {
    console.warn('[Routing] Failed:', err);
    return [];
  }
}

// Build a detour waypoint offset perpendicular to the A→B line at the given fraction
function detourWaypoint(pointA, pointB, frac, perpMeters) {
  const mLng = pointA.lng + (pointB.lng - pointA.lng) * frac;
  const mLat = pointA.lat + (pointB.lat - pointA.lat) * frac;
  const brng = Math.atan2(pointB.lng - pointA.lng, pointB.lat - pointA.lat);
  const perp = brng + Math.PI / 2;
  const dLat = (perpMeters * Math.cos(perp)) / 110540;
  const dLng = (perpMeters * Math.sin(perp)) / (111320 * Math.cos(mLat * Math.PI / 180));
  return { lng: mLng + dLng, lat: mLat + dLat };
}

// Fetch routes. The public OSRM server rarely returns real alternatives, so we
// synthesize them by routing through perpendicular detour waypoints, then dedupe.
async function fetchRoutes(pointA, pointB) {
  const requests = [fetchOsrmRoute([pointA, pointB])];
  ROUTE_CONFIG.detourOffsets.forEach(perp => {
    requests.push(fetchOsrmRoute([pointA, detourWaypoint(pointA, pointB, 0.5, perp), pointB]));
  });

  const results = await Promise.all(requests);
  const all = results.flat().filter(r => r && r.geometry && r.geometry.coordinates);

  // Dedupe: skip a route whose distance is within 2% of one already kept
  const unique = [];
  for (const r of all) {
    const dup = unique.some(u => Math.abs(u.distance - r.distance) / Math.max(u.distance, 1) < 0.02);
    if (!dup) unique.push(r);
  }

  unique.sort((a, b) => a.distance - b.distance);
  return unique.slice(0, ROUTE_CONFIG.maxAlternatives);
}

// ════════════════════════════════════════════════════════════════════════════
// GEO UTILITIES
// ════════════════════════════════════════════════════════════════════════════

// Haversine distance in meters
function haversine(lat1, lng1, lat2, lng2) {
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Distance from point to line segment (in meters)
function pointToSegmentDist(p, a, b) {
  const toMeters = (lat, lng) => {
    const x = lng * 111320 * Math.cos(a.lat * Math.PI / 180);
    const y = lat * 110540;
    return [x, y];
  };
  const [px, py] = toMeters(p.lat, p.lng);
  const [ax, ay] = toMeters(a.lat, a.lng);
  const [bx, by] = toMeters(b.lat, b.lng);

  const dx = bx - ax;
  const dy = by - ay;
  const lenSq = dx * dx + dy * dy;

  if (lenSq === 0) return Math.hypot(px - ax, py - ay);

  let t = ((px - ax) * dx + (py - ay) * dy) / lenSq;
  t = Math.max(0, Math.min(1, t));

  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
}

// Bearing between two points in degrees (0-360)
function bearing(lat1, lng1, lat2, lng2) {
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const y = Math.sin(dLng) * Math.cos(lat2 * Math.PI / 180);
  const x = Math.cos(lat1 * Math.PI / 180) * Math.sin(lat2 * Math.PI / 180) -
    Math.sin(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.cos(dLng);
  return (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
}

// Angular difference between two bearings (0-180)
function angleDiff(a, b) {
  let d = Math.abs(a - b);
  if (d > 180) d = 360 - d;
  return d;
}

// Format distance
function fmtDist(m) {
  const tr = ROUTE_I18N[currentLang];
  if (m < 1000) return `${Math.round(m)} ${tr.meters}`;
  return `${(m / 1000).toFixed(1)} ${tr.km}`;
}

// Format duration
function fmtDur(s) {
  const tr = ROUTE_I18N[currentLang];
  const min = Math.round(s / 60);
  if (min < 60) return `${min} ${tr.minutes}`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${h}ч ${m}${tr.minutes}`;
}

// Format distance strictly in kilometers
function fmtKm(m) {
  const tr = ROUTE_I18N[currentLang];
  const km = m / 1000;
  const val = km < 10 ? km.toFixed(2) : km.toFixed(1);
  return `${val} ${tr.km}`;
}

// Estimated time of arrival
function fmtETA(durationS) {
  const tr = ROUTE_I18N[currentLang];
  const arrival = new Date(Date.now() + durationS * 1000);
  const hh = String(arrival.getHours()).padStart(2, '0');
  const mm = String(arrival.getMinutes()).padStart(2, '0');
  return `${tr.around} ${hh}:${mm}`;
}

// ════════════════════════════════════════════════════════════════════════════
// RISK SCORING
// ════════════════════════════════════════════════════════════════════════════

function computeVisibilityCoef(building, segStart, segEnd, sunAzimuth) {
  const moveBearing = bearing(segStart.lat, segStart.lng, segEnd.lat, segEnd.lng);
  const sunMoveDiff = angleDiff(moveBearing, sunAzimuth);

  let dirCoef;
  if (sunMoveDiff <= ROUTE_CONFIG.sunAngleTolerance) {
    dirCoef = 1.0;
  } else if (sunMoveDiff <= ROUTE_CONFIG.sunAngleTolerance + 30) {
    dirCoef = 0.5;
  } else if (sunMoveDiff <= 90) {
    dirCoef = 0.2;
  } else {
    dirCoef = 0.05;
  }

  let orientCoef = 1.0;
  if (building.orientation != null && building.orientation !== 0) {
    const reflectAz = (sunAzimuth + 180) % 360;
    const orientDiff = angleDiff(reflectAz, building.orientation);
    if (orientDiff < 30) orientCoef = 1.0;
    else if (orientDiff < 60) orientCoef = 0.6;
    else if (orientDiff < 90) orientCoef = 0.3;
    else orientCoef = 0.1;
  }

  return dirCoef * orientCoef;
}

function estimateExposureTime(segLengthM, routeDurationS, routeDistanceM) {
  if (routeDistanceM === 0) return 0;
  const avgSpeed = routeDistanceM / routeDurationS;
  return segLengthM / avgSpeed;
}

function distanceFalloff(distM, radius) {
  if (distM >= radius) return 0;
  return Math.max(0.1, 1 - distM / radius);
}

// Buildings are static for the lifetime of a loaded dataset. Indexing them once
// avoids checking every building against every route segment.
const BUILDING_GRID_CELL_SIZE = 300;
const BUILDING_GRID_LAT_METERS = 110574;
const BUILDING_GRID_LNG_METERS = 111320 * Math.cos(ASTANA.lat * Math.PI / 180);
let buildingSpatialIndex = { source: null, size: 0, cells: null };

function buildingGridKey(x, y) {
  return `${x}:${y}`;
}

function getBuildingSpatialIndex() {
  // `loadBuildings` replaces the array, so a new dataset automatically gets a
  // fresh index. The length check also covers appending candidates in place.
  if (buildingSpatialIndex.source === buildings &&
      buildingSpatialIndex.size === buildings.length) {
    return buildingSpatialIndex;
  }

  const cells = new Map();
  for (const building of buildings) {
    if (!Number.isFinite(building.lat) || !Number.isFinite(building.lng)) continue;

    const x = Math.floor(building.lng * BUILDING_GRID_LNG_METERS / BUILDING_GRID_CELL_SIZE);
    const y = Math.floor(building.lat * BUILDING_GRID_LAT_METERS / BUILDING_GRID_CELL_SIZE);
    const key = buildingGridKey(x, y);
    const cell = cells.get(key);
    if (cell) cell.push(building);
    else cells.set(key, [building]);
  }

  buildingSpatialIndex = { source: buildings, size: buildings.length, cells };
  return buildingSpatialIndex;
}

function getSegmentBuildingCandidates(segmentCoords, searchRadius) {
  const index = getBuildingSpatialIndex();
  if (index.cells.size === 0) return [];

  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  for (const [lng, lat] of segmentCoords) {
    const x = lng * BUILDING_GRID_LNG_METERS;
    const y = lat * BUILDING_GRID_LAT_METERS;
    minX = Math.min(minX, x);
    maxX = Math.max(maxX, x);
    minY = Math.min(minY, y);
    maxY = Math.max(maxY, y);
  }

  // The small pad makes the equirectangular grid conservative; exact distance
  // is still calculated below with pointToSegmentDist.
  const bboxPadding = searchRadius + 10;
  const fromCellX = Math.floor((minX - bboxPadding) / BUILDING_GRID_CELL_SIZE);
  const toCellX = Math.floor((maxX + bboxPadding) / BUILDING_GRID_CELL_SIZE);
  const fromCellY = Math.floor((minY - bboxPadding) / BUILDING_GRID_CELL_SIZE);
  const toCellY = Math.floor((maxY + bboxPadding) / BUILDING_GRID_CELL_SIZE);
  const candidates = [];

  for (let x = fromCellX; x <= toCellX; x++) {
    for (let y = fromCellY; y <= toCellY; y++) {
      const cell = index.cells.get(buildingGridKey(x, y));
      if (cell) candidates.push(...cell);
    }
  }

  return candidates;
}

function evaluateRoute(routeGeojson, durationS, distanceM) {
  const coords = routeGeojson.coordinates;
  const weatherMul = computeWeatherMultiplier();
  const sun = getSunPosition(new Date(), ASTANA.lat, ASTANA.lng);
  const sunAzimuth = sun.azimuth;
  const sunAltitude = sun.altitude;

  const sunActive = sunAltitude > 0;

  const segments = [];
  let currentSeg = { coords: [coords[0]], length: 0, riskScore: 0, nearbyBuildings: [] };

  for (let i = 1; i < coords.length; i++) {
    const prev = coords[i - 1];
    const curr = coords[i];
    const segLen = haversine(prev[1], prev[0], curr[1], curr[0]);

    currentSeg.coords.push(curr);
    currentSeg.length += segLen;

    if (currentSeg.length >= ROUTE_CONFIG.segmentChunkSize || i === coords.length - 1) {
      if (sunActive) {
        const segStart = { lat: currentSeg.coords[0][1], lng: currentSeg.coords[0][0] };
        const segEnd = { lat: currentSeg.coords[currentSeg.coords.length - 1][1], lng: currentSeg.coords[currentSeg.coords.length - 1][0] };

        let segRisk = 0;

        // The grid/bbox query removes distant buildings before the expensive
        // point-to-polyline distance calculation.
        const nearbyCandidates = getSegmentBuildingCandidates(
          currentSeg.coords,
          ROUTE_CONFIG.searchRadius,
        );
        for (const b of nearbyCandidates) {
          let minDist = Infinity;
          for (let j = 1; j < currentSeg.coords.length; j++) {
            const a = { lat: currentSeg.coords[j - 1][1], lng: currentSeg.coords[j - 1][0] };
            const c = { lat: currentSeg.coords[j][1], lng: currentSeg.coords[j][0] };
            const d = pointToSegmentDist({ lat: b.lat, lng: b.lng }, a, c);
            if (d < minDist) minDist = d;
          }

          if (minDist < ROUTE_CONFIG.searchRadius) {
            const effLux = computeEffectiveLux(b, weatherMul);
            if (effLux <= 0) continue;

            const visCoef = computeVisibilityCoef(b, segStart, segEnd, sunAzimuth);
            const falloff = distanceFalloff(minDist, ROUTE_CONFIG.searchRadius);
            const exposureTime = estimateExposureTime(currentSeg.length, durationS, distanceM);

            const contribution = effLux * exposureTime * visCoef * falloff;

            if (contribution > 0) {
              segRisk += contribution;
              currentSeg.nearbyBuildings.push({
                building: b,
                distance: Math.round(minDist),
                lux: effLux,
                exposureTime: Math.round(exposureTime),
                visibilityCoef: visCoef,
                falloff: falloff,
                contribution: Math.round(contribution),
              });
            }
          }
        }

        currentSeg.riskScore = Math.round(segRisk);
      } else {
        currentSeg.riskScore = 0;
      }

      const riskPerMeter = currentSeg.length > 0 ? currentSeg.riskScore / currentSeg.length : 0;
      if (riskPerMeter > 500) currentSeg.level = 'danger';
      else if (riskPerMeter > 100) currentSeg.level = 'warning';
      else currentSeg.level = 'safe';

      segments.push(currentSeg);
      currentSeg = { coords: [curr], length: 0, riskScore: 0, nearbyBuildings: [] };
    }
  }

  segments.forEach(s => {
    s.nearbyBuildings.sort((a, b) => b.contribution - a.contribution);
  });

  const totalRisk = segments.reduce((sum, s) => sum + s.riskScore, 0);
  const dangerZones = segments.filter(s => s.level === 'danger').length;
  const warningZones = segments.filter(s => s.level === 'warning').length;

  return {
    segments,
    totalRiskScore: totalRisk,
    dangerZoneCount: dangerZones,
    warningZoneCount: warningZones,
    distance: distanceM,
    duration: durationS,
    coordinates: coords,
  };
}

// ════════════════════════════════════════════════════════════════════════════
// ROUTE BUILDING ORCHESTRATION
// ════════════════════════════════════════════════════════════════════════════

async function buildSafeRoute() {
  if (!routeState.pointA || !routeState.pointB) return;

  const requestId = ++routeState.buildRequestId;
  routeState.loading = true;
  updateRoutePanel();

  try {
    const rawRoutes = await fetchRoutes(routeState.pointA, routeState.pointB);

    // A newer position may have already triggered a replacement route.
    if (requestId !== routeState.buildRequestId) return;

    if (rawRoutes.length === 0) {
      showRouteError(rt('noRoute'));
      routeState.loading = false;
      updateRoutePanel();
      return;
    }

    const evaluated = rawRoutes.map(r =>
      evaluateRoute(r.geometry, r.duration, r.distance)
    );

    if (requestId !== routeState.buildRequestId) return;

    evaluated.sort((a, b) => a.totalRiskScore - b.totalRiskScore);

    routeState.routes = evaluated;
    routeState.selectedRouteIdx = 0;
    routeState.active = true;
    routeState.loading = false;

    renderRouteOnMap();
    refreshCurrentZoneLevel();
    updateRoutePanel();
  } catch (err) {
    if (requestId !== routeState.buildRequestId) return;
    console.error('[Route] Build failed:', err);
    showRouteError(rt('routeError'));
    routeState.loading = false;
    updateRoutePanel();
  }
}

function clearRoute() {
  routeState.buildRequestId += 1;
  routeState.pointA = null;
  routeState.pointB = null;
  routeState.routes = [];
  routeState.selectedRouteIdx = 0;
  routeState.active = false;
  routeState.loading = false;
  routeState.pickingFor = null;
  routeState.followsUserLocation = false;
  routeState.lastRouteOrigin = null;
  routeState.currentZoneLevel = null;

  const inputA = document.getElementById('routeInputA');
  const inputB = document.getElementById('routeInputB');
  if (inputA) inputA.value = '';
  if (inputB) inputB.value = '';

  removeRouteLayers();

  if (routeState.markerA) { routeState.markerA.remove(); routeState.markerA = null; }
  if (routeState.markerB) { routeState.markerB.remove(); routeState.markerB = null; }

  if (map) map.getCanvas().style.cursor = '';

  updateLocationButton();
  updateRoutePanel();
}

// ════════════════════════════════════════════════════════════════════════════
// LIVE GEOLOCATION
// ════════════════════════════════════════════════════════════════════════════

function updateLocationButton() {
  const button = document.getElementById('routeLocationBtn');
  if (button) button.classList.toggle('route-location-btn--active', routeState.followsUserLocation);
}

function stopFollowingUserLocation() {
  routeState.followsUserLocation = false;
  routeState.lastRouteOrigin = null;
  updateLocationButton();
}

function updateUserMarker() {
  const position = routeState.userPosition;
  if (!position || !map) return;

  if (!routeState.userMarker) {
    const el = document.createElement('div');
    el.className = 'route-user-marker';
    routeState.userMarker = new maplibregl.Marker({ element: el })
      .setLngLat([position.lng, position.lat])
      .addTo(map);
  } else {
    routeState.userMarker.setLngLat([position.lng, position.lat]);
  }
}

function getCurrentZoneLevel() {
  const position = routeState.userPosition;
  if (!position) return null;

  // Building zones are available even before a destination is selected.
  // The same radius is used by the route risk calculation, so the map and
  // live alert describe one consistent danger area.
  let warningFound = false;
  for (const building of buildings) {
    if (building.level !== 'danger' && building.level !== 'warning') continue;
    if (haversine(position.lat, position.lng, building.lat, building.lng) <= ROUTE_CONFIG.searchRadius) {
      if (building.level === 'danger') return 'danger';
      warningFound = true;
    }
  }

  const route = routeState.routes[routeState.selectedRouteIdx];
  if (!route) return warningFound ? 'warning' : null;

  // GPS accuracy varies, but the alert should still represent the colored
  // route segment the user is currently travelling on.
  const radius = Math.max(
    ROUTE_CONFIG.locationZoneRadius,
    Math.min(position.accuracy || 0, 60)
  );
  for (const segment of route.segments) {
    if (segment.level === 'safe') continue;
    for (let i = 1; i < segment.coords.length; i++) {
      const a = { lng: segment.coords[i - 1][0], lat: segment.coords[i - 1][1] };
      const b = { lng: segment.coords[i][0], lat: segment.coords[i][1] };
      if (pointToSegmentDist(position, a, b) <= radius) {
        if (segment.level === 'danger') return 'danger';
        warningFound = true;
        break;
      }
    }
  }

  return warningFound ? 'warning' : null;
}

function refreshCurrentZoneLevel() {
  routeState.currentZoneLevel = getCurrentZoneLevel();
}

function setPointAToUserLocation(forceRouteUpdate = false) {
  const position = routeState.userPosition;
  if (!position) return;

  const hasMovedEnough = !routeState.lastRouteOrigin ||
    haversine(
      routeState.lastRouteOrigin.lat,
      routeState.lastRouteOrigin.lng,
      position.lat,
      position.lng
    ) >= ROUTE_CONFIG.locationRouteUpdateDistance;
  const canUpdateNow = Date.now() - routeState.lastLocationRouteUpdateAt >=
    ROUTE_CONFIG.locationRouteUpdateInterval;

  if (!forceRouteUpdate && (!hasMovedEnough || !canUpdateNow)) return;

  routeState.pointA = {
    lng: position.lng,
    lat: position.lat,
    label: rt('currentLocation'),
  };
  routeState.lastRouteOrigin = { lng: position.lng, lat: position.lat };
  routeState.lastLocationRouteUpdateAt = Date.now();

  const inputA = document.getElementById('routeInputA');
  if (inputA) inputA.value = rt('currentLocation');
  updateEndpointMarker('pointA');

  if (routeState.pointB) buildSafeRoute();
}

function handleUserPosition(geoPosition) {
  const { latitude, longitude, accuracy } = geoPosition.coords;
  const positionAccuracy = Number.isFinite(accuracy) ? accuracy : Infinity;
  const timestamp = Number(geoPosition.timestamp) || Date.now();

  if (positionAccuracy > ROUTE_CONFIG.locationMaxAccuracy) {
    if (!routeState.userPosition) showRouteError(rt('locationAccuracyPoor'));
    return false;
  }

  if (timestamp <= routeState.lastPositionTimestamp) return false;

  if (routeState.userPosition) {
    const elapsedSeconds = Math.max(1, (timestamp - routeState.lastPositionTimestamp) / 1000);
    const travelled = haversine(
      routeState.userPosition.lat,
      routeState.userPosition.lng,
      latitude,
      longitude
    );
    const allowedDistance = Math.max(
      150,
      elapsedSeconds * ROUTE_CONFIG.locationMaxSpeed + positionAccuracy * 2
    );
    if (travelled > allowedDistance) return false;
  }

  routeState.userPosition = {
    lat: latitude,
    lng: longitude,
    accuracy: positionAccuracy,
  };
  routeState.lastPositionTimestamp = timestamp;
  updateUserMarker();

  if (routeState.followsUserLocation) {
    setPointAToUserLocation();
  }

  const previousLevel = routeState.currentZoneLevel;
  refreshCurrentZoneLevel();
  if (previousLevel !== routeState.currentZoneLevel) updateRoutePanel();
  return true;
}

function handleLocationError(error) {
  const message = error && error.code === error.PERMISSION_DENIED
    ? rt('locationDenied')
    : rt('locationUnavailable');
  showRouteError(message);
  const button = document.getElementById('routeLocationBtn');
  if (button) button.classList.remove('route-location-btn--loading');
}

function ensureLocationWatch() {
  if (routeState.geoWatchId != null || !navigator.geolocation) return;
  routeState.geoWatchId = navigator.geolocation.watchPosition(
    handleUserPosition,
    handleLocationError,
    { enableHighAccuracy: true, maximumAge: 0, timeout: 20000 }
  );
}

function useCurrentLocationForPointA() {
  if (!navigator.geolocation) {
    showRouteError(rt('locationUnavailable'));
    return;
  }

  const button = document.getElementById('routeLocationBtn');
  if (button) button.classList.add('route-location-btn--loading');

  navigator.geolocation.getCurrentPosition((geoPosition) => {
    if (button) button.classList.remove('route-location-btn--loading');
    const accepted = handleUserPosition(geoPosition);
    routeState.followsUserLocation = true;
    updateLocationButton();
    if (accepted) setPointAToUserLocation(true);
    if (accepted && map && routeState.userPosition) {
      map.flyTo({ center: [routeState.userPosition.lng, routeState.userPosition.lat], zoom: Math.max(map.getZoom(), 15) });
    }
    ensureLocationWatch();
  }, handleLocationError, {
    enableHighAccuracy: true,
    maximumAge: 0,
    timeout: 20000,
  });
}

// ════════════════════════════════════════════════════════════════════════════
// MAP VISUALIZATION
// ════════════════════════════════════════════════════════════════════════════

const ROUTE_COLORS = {
  safe: '#32D2AB',
  warning: '#F8B84A',
  danger: '#FF5A3C',
};

function removeRouteLayers() {
  if (!map) return;
  ['route-alt', 'route-safe', 'route-warning', 'route-danger', 'route-hitarea-danger', 'route-hitarea-warning', 'route-casing', 'route-points'].forEach(id => {
    if (map.getLayer(id)) map.removeLayer(id);
  });
  ['route-alternatives', 'route-segments', 'route-endpoints'].forEach(id => {
    if (map.getSource(id)) map.removeSource(id);
  });
}

function renderRouteOnMap() {
  if (!map || routeState.routes.length === 0) return;

  removeRouteLayers();

  const route = routeState.routes[routeState.selectedRouteIdx];
  const tr = ROUTE_I18N[currentLang];

  const segmentFeatures = route.segments.map(seg => ({
    type: 'Feature',
    geometry: {
      type: 'LineString',
      coordinates: seg.coords,
    },
    properties: {
      level: seg.level,
      riskScore: seg.riskScore,
      buildingName: seg.nearbyBuildings.length > 0
        ? (currentLang === 'en' ? (seg.nearbyBuildings[0].building.name_en || seg.nearbyBuildings[0].building.name) : seg.nearbyBuildings[0].building.name)
        : '',
      buildingLux: seg.nearbyBuildings.length > 0 ? seg.nearbyBuildings[0].lux : 0,
      buildingDist: seg.nearbyBuildings.length > 0 ? seg.nearbyBuildings[0].distance : 0,
      exposureTime: seg.nearbyBuildings.length > 0 ? seg.nearbyBuildings[0].exposureTime : 0,
      visCoef: seg.nearbyBuildings.length > 0 ? seg.nearbyBuildings[0].visibilityCoef : 0,
      nearbyCount: seg.nearbyBuildings.length,
    },
  }));

  map.addSource('route-segments', {
    type: 'geojson',
    data: { type: 'FeatureCollection', features: segmentFeatures },
  });

  const altFeatures = routeState.routes
    .map((r, i) => ({ r, i }))
    .filter(({ i }) => i !== routeState.selectedRouteIdx)
    .map(({ r, i }) => ({
      type: 'Feature',
      geometry: { type: 'LineString', coordinates: r.coordinates },
      properties: { routeIdx: i },
    }));

  if (altFeatures.length > 0) {
    map.addSource('route-alternatives', {
      type: 'geojson',
      data: { type: 'FeatureCollection', features: altFeatures },
    });
    map.addLayer({
      id: 'route-alt',
      type: 'line',
      source: 'route-alternatives',
      layout: { 'line-join': 'round', 'line-cap': 'round' },
      paint: {
        'line-color': mapPaint().stroke,
        'line-width': 4,
        'line-opacity': 0.35,
        'line-dasharray': [2, 2],
      },
    });

    map.on('click', 'route-alt', (e) => {
      const f = e.features && e.features[0];
      if (!f) return;
      const idx = f.properties.routeIdx;
      if (typeof idx === 'number' && idx !== routeState.selectedRouteIdx) {
        routeState.selectedRouteIdx = idx;
        renderRouteOnMap();
        refreshCurrentZoneLevel();
        updateRoutePanel();
      }
    });
    map.on('mouseenter', 'route-alt', () => { map.getCanvas().style.cursor = 'pointer'; });
    map.on('mouseleave', 'route-alt', () => { map.getCanvas().style.cursor = ''; });
  }

  map.addLayer({
    id: 'route-casing',
    type: 'line',
    source: 'route-segments',
    layout: {
      'line-join': 'round',
      'line-cap': 'round',
    },
    paint: {
      'line-color': mapPaint().stroke,
      'line-width': 8,
      'line-opacity': 0.4,
    },
  });

  Object.entries(ROUTE_COLORS).forEach(([level, color]) => {
    map.addLayer({
      id: `route-${level}`,
      type: 'line',
      source: 'route-segments',
      filter: ['==', ['get', 'level'], level],
      layout: {
        'line-join': 'round',
        'line-cap': 'round',
      },
      paint: {
        'line-color': color,
        'line-width': 5,
        'line-opacity': 0.9,
      },
    });
  });

  ['danger', 'warning'].forEach(level => {
    map.addLayer({
      id: `route-hitarea-${level}`,
      type: 'line',
      source: 'route-segments',
      filter: ['==', ['get', 'level'], level],
      layout: { 'line-join': 'round', 'line-cap': 'round' },
      paint: {
        'line-color': '#000000',
        'line-width': 24,
        'line-opacity': 0,
      },
    });
  });

  const endpointFeatures = [
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [routeState.pointA.lng, routeState.pointA.lat] },
      properties: { label: 'A', name: routeState.pointA.label || rt('pointA') },
    },
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [routeState.pointB.lng, routeState.pointB.lat] },
      properties: { label: 'B', name: routeState.pointB.label || rt('pointB') },
    },
  ];

  map.addSource('route-endpoints', {
    type: 'geojson',
    data: { type: 'FeatureCollection', features: endpointFeatures },
  });

  map.addLayer({
    id: 'route-points',
    type: 'circle',
    source: 'route-endpoints',
    paint: {
      'circle-radius': 10,
      'circle-color': '#fff',
      'circle-stroke-width': 3,
      'circle-stroke-color': ['match', ['get', 'label'], 'A', '#32D2AB', '#FF5A3C', '#FF5A3C'],
    },
  });

  const tooltipPopup = new maplibregl.Popup({
    offset: 16,
    closeButton: false,
    closeOnClick: false,
    maxWidth: '300px',
  });

  function buildSegmentTooltipHtml(p) {
    const level = p.level;
    const levelLabel = level === 'danger' ? rt('segmentDanger') : rt('segmentWarning');

    let html = `<div class="route-tooltip">`;
    html += `<div class="route-tooltip-level route-tooltip-level--${level}">${levelLabel}</div>`;
    if (p.buildingName) {
      const visStatus = getVisibilityText(Number(p.visCoef || 0));
      html += `<div class="route-tooltip-building">${rt('blindingBuilding')}: <strong>${escapeHtml(p.buildingName)}</strong></div>`;
      html += `<div class="route-tooltip-row"><span>${rt('luxAtBuilding')}</span><span>${Number(p.buildingLux).toLocaleString(tr.locale)} ${tr.luxUnit}</span></div>`;
      html += `<div class="route-tooltip-row"><span>${rt('distance')}</span><span>${p.buildingDist} ${tr.meters}</span></div>`;
      html += `<div class="route-tooltip-row"><span>${rt('exposureTime')}</span><span>${p.exposureTime}s</span></div>`;
      html += `<div class="route-tooltip-row"><span>${rt('visibilityCoef')}</span><span>${visStatus.label}</span></div>`;
      html += `<div class="route-tooltip-reason">${rt('directionMatch')} (±${ROUTE_CONFIG.sunAngleTolerance}°)</div>`;
    } else {
      html += `<div class="route-tooltip-row">${rt('noRiskZones')}</div>`;
    }
    html += `</div>`;
    return html;
  }

  const tooltipHitLayers = ['route-hitarea-danger', 'route-hitarea-warning'];

  tooltipHitLayers.forEach(layerId => {
    map.on('mouseenter', layerId, (e) => {
      map.getCanvas().style.cursor = 'pointer';
      const f = e.features && e.features[0];
      if (!f) return;
      tooltipPopup.setHTML(buildSegmentTooltipHtml(f.properties));
      tooltipPopup.setLngLat(e.lngLat).addTo(map);
    });

    map.on('mouseleave', layerId, () => {
      map.getCanvas().style.cursor = '';
      tooltipPopup.remove();
    });

    map.on('click', layerId, (e) => {
      const f = e.features && e.features[0];
      if (!f) return;
      tooltipPopup.setHTML(buildSegmentTooltipHtml(f.properties));
      tooltipPopup.setLngLat(e.lngLat).addTo(map);
    });
  });

  map.on('click', (e) => {
    const hits = map.queryRenderedFeatures(e.point, { layers: tooltipHitLayers });
    if (hits.length === 0) tooltipPopup.remove();
  });

  const bounds = new maplibregl.LngLatBounds(route.coordinates[0], route.coordinates[0]);
  routeState.routes.forEach(r => r.coordinates.forEach(c => bounds.extend(c)));
  map.fitBounds(bounds, { padding: 60 });
}

// ════════════════════════════════════════════════════════════════════════════
// UI — ROUTE PANEL
// ════════════════════════════════════════════════════════════════════════════

function showRouteError(msg) {
  const el = document.getElementById('routeError');
  if (el) {
    el.textContent = msg;
    el.style.display = 'block';
    setTimeout(() => { el.style.display = 'none'; }, 5000);
  }
}

function updateRoutePanel() {
  const panel = document.getElementById('routePanelBody');
  if (!panel) return;

  const tr = ROUTE_I18N[currentLang];

  if (routeState.loading) {
    panel.innerHTML = `<div class="route-loading"><span class="route-spinner"></span>${rt('loading')}</div>`;
    return;
  }

  if (!routeState.active || routeState.routes.length === 0) {
    panel.innerHTML = routeState.currentZoneLevel
      ? `<div class="route-location-alert route-location-alert--${routeState.currentZoneLevel}">
          ${routeState.currentZoneLevel === 'danger' ? rt('inDangerZone') : rt('inWarningZone')}
        </div>`
      : '';
    return;
  }

  const route = routeState.routes[routeState.selectedRouteIdx];
  const hasAlt = routeState.routes.length > 1;
  const locationAlertHTML = routeState.currentZoneLevel
    ? `<div class="route-location-alert route-location-alert--${routeState.currentZoneLevel}">
        ${routeState.currentZoneLevel === 'danger' ? rt('inDangerZone') : rt('inWarningZone')}
      </div>`
    : '';

  let comparisonHTML = '';
  if (hasAlt) {
    comparisonHTML = `<div class="route-comparison">
      <h5>${tr.comparison} <span class="route-comparison-count">${tr.alternativesCount}: ${routeState.routes.length}</span></h5>
      <div class="route-comparison-grid">`;

    routeState.routes.forEach((r, i) => {
      const isSel = i === routeState.selectedRouteIdx;
      const label = i === 0 ? tr.bestRoute : `${tr.routeAlt} ${i}`;
      const routeStatus = getRouteRiskStatus(r);
      const routeStatusClass = routeStatus.level === 'danger' ? 'danger' : (routeStatus.level === 'warning' ? 'warning' : 'safe');
      comparisonHTML += `
        <button class="route-comparison-card ${isSel ? 'route-comparison-card--active' : ''}" data-route-idx="${i}">
          <div class="route-comparison-label">${label}</div>
          <div class="route-comparison-stats">
            <span title="${tr.routeDistance}">📏 ${fmtKm(r.distance)}</span>
            <span title="${tr.routeDuration}">⏱ ${fmtDur(r.duration)}</span>
            <span title="${tr.eta}">🕒 ${fmtETA(r.duration)}</span>
          </div>
          <div class="route-comparison-risk">
            <span class="route-risk-dot route-risk-dot--${routeStatusClass}"></span>
            ${tr.riskLevel}: ${routeStatus.label}
          </div>
          <div class="route-comparison-zones">${tr.dangerZones}: ${r.dangerZoneCount}</div>
        </button>`;
    });

    comparisonHTML += `</div></div>`;
  }

  const routeStatus = getRouteRiskStatus(route);
  const statusClass = routeStatus.level;

  panel.innerHTML = `
    <div class="route-summary">
      ${locationAlertHTML}
      <div class="route-status route-status--${statusClass}">
        <span class="route-status-dot"></span>
        ${routeStatus.label}
      </div>
      <div class="route-stats">
        <div class="route-stat">
          <span class="route-stat-label">${tr.routeDistance}</span>
          <span class="route-stat-value">${fmtKm(route.distance)}</span>
        </div>
        <div class="route-stat">
          <span class="route-stat-label">${tr.routeDuration}</span>
          <span class="route-stat-value">${fmtDur(route.duration)}</span>
        </div>
        <div class="route-stat">
          <span class="route-stat-label">${tr.eta}</span>
          <span class="route-stat-value">${fmtETA(route.duration)}</span>
        </div>
        <div class="route-stat">
          <span class="route-stat-label">${tr.dangerZones}</span>
          <span class="route-stat-value route-stat-value--${route.dangerZoneCount > 0 ? 'danger' : 'safe'}">${route.dangerZoneCount}</span>
        </div>
        <div class="route-stat">
          <span class="route-stat-label">${tr.riskLevel}</span>
          <span class="route-stat-value route-stat-value--${statusClass}">${routeStatus.label}</span>
        </div>
      </div>
    </div>
    ${comparisonHTML}
  `;

  panel.querySelectorAll('.route-comparison-card').forEach(card => {
    card.addEventListener('click', () => {
      const idx = parseInt(card.dataset.routeIdx);
      routeState.selectedRouteIdx = idx;
      renderRouteOnMap();
      refreshCurrentZoneLevel();
      updateRoutePanel();
    });
  });
}

// ════════════════════════════════════════════════════════════════════════════
// UI — AUTOCOMPLETE
// ════════════════════════════════════════════════════════════════════════════

function createAutocomplete(inputId, suggestionsId, pointKey) {
  const input = document.getElementById(inputId);
  const suggBox = document.getElementById(suggestionsId);
  if (!input || !suggBox) return;

  let debounceTimer = null;
  let requestVersion = 0;

  input.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    const query = input.value.trim();
    const thisRequestVersion = ++requestVersion;

    if (query.length < 2) {
      suggBox.style.display = 'none';
      return;
    }

    debounceTimer = setTimeout(async () => {
      const results = await geocodeSearch(query);
      // Do not replace suggestions for a newer input value with a slow,
      // already obsolete geocoding response.
      if (thisRequestVersion !== requestVersion || input.value.trim() !== query) return;

      if (results.length === 0) {
        suggBox.style.display = 'none';
        return;
      }

      suggBox.innerHTML = results.map((r, i) =>
        `<div class="route-suggestion" data-idx="${i}">${escapeHtml(r.place)}</div>`
      ).join('');

      suggBox.style.display = 'block';

      input._results = results;

      suggBox.querySelectorAll('.route-suggestion').forEach(el => {
        el.addEventListener('click', () => {
          const idx = parseInt(el.dataset.idx);
          const result = results[idx];
          input.value = result.label;
          suggBox.style.display = 'none';

          routeState[pointKey] = {
            lng: result.lng,
            lat: result.lat,
            label: result.label,
          };

          if (pointKey === 'pointA') stopFollowingUserLocation();

          updateEndpointMarker(pointKey);
          tryBuildRoute();
        });
      });
    }, ROUTE_CONFIG.debounceMs);
  });

  input.addEventListener('blur', () => {
    setTimeout(() => { suggBox.style.display = 'none'; }, 200);
  });

  input.addEventListener('focus', () => {
    if (input._results && input._results.length > 0 && input.value.trim().length >= 2) {
      suggBox.style.display = 'block';
    }
  });
}

function updateEndpointMarker(pointKey) {
  const point = routeState[pointKey];
  const markerKey = pointKey === 'pointA' ? 'markerA' : 'markerB';
  const color = pointKey === 'pointA' ? '#32D2AB' : '#FF5A3C';

  if (routeState[markerKey]) {
    routeState[markerKey].remove();
  }

  if (point && map) {
    const el = document.createElement('div');
    el.className = 'route-endpoint-marker';
    el.style.backgroundColor = color;
    el.textContent = pointKey === 'pointA' ? 'A' : 'B';

    routeState[markerKey] = new maplibregl.Marker({ element: el })
      .setLngLat([point.lng, point.lat])
      .addTo(map);
  }
}

function tryBuildRoute() {
  if (routeState.pointA && routeState.pointB) {
    buildSafeRoute();
  }
}

// ════════════════════════════════════════════════════════════════════════════
// MAP CLICK — pick point on map
// ════════════════════════════════════════════════════════════════════════════

function initMapClickPicker() {
  if (!map) return;

  map.on('click', (e) => {
    if (!routeState.pickingFor) return;

    const { lng, lat } = e.lngLat;
    const pointKey = routeState.pickingFor === 'A' ? 'pointA' : 'pointB';
    const inputId = routeState.pickingFor === 'A' ? 'routeInputA' : 'routeInputB';

    routeState[pointKey] = {
      lng,
      lat,
      label: `${lat.toFixed(5)}, ${lng.toFixed(5)}`,
    };

    if (pointKey === 'pointA') stopFollowingUserLocation();

    const input = document.getElementById(inputId);
    if (input) input.value = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;

    updateEndpointMarker(pointKey);

    routeState.pickingFor = null;
    map.getCanvas().style.cursor = '';

    document.querySelectorAll('.route-pick-btn').forEach(btn => {
      btn.classList.remove('route-pick-btn--active');
    });

    tryBuildRoute();
  });
}

// ════════════════════════════════════════════════════════════════════════════
// INITIALIZATION
// ════════════════════════════════════════════════════════════════════════════

function initRouteModule() {
  createAutocomplete('routeInputA', 'routeSuggestionsA', 'pointA');
  createAutocomplete('routeInputB', 'routeSuggestionsB', 'pointB');

  const buildBtn = document.getElementById('routeBuildBtn');
  if (buildBtn) {
    buildBtn.addEventListener('click', () => {
      if (routeState.pointA && routeState.pointB) {
        buildSafeRoute();
      }
    });
  }

  const clearBtn = document.getElementById('routeClearBtn');
  if (clearBtn) {
    clearBtn.addEventListener('click', clearRoute);
  }

  const locationBtn = document.getElementById('routeLocationBtn');
  if (locationBtn) locationBtn.addEventListener('click', useCurrentLocationForPointA);

  document.querySelectorAll('.route-pick-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.pick;

      if (routeState.pickingFor === target) {
        routeState.pickingFor = null;
        btn.classList.remove('route-pick-btn--active');
        if (map) map.getCanvas().style.cursor = '';
      } else {
        routeState.pickingFor = target;
        document.querySelectorAll('.route-pick-btn').forEach(b => {
          b.classList.toggle('route-pick-btn--active', b === btn);
        });
        if (map) map.getCanvas().style.cursor = 'crosshair';
      }
    });
  });

  const panelToggle = document.getElementById('routePanelToggle');
  const panelEl = document.getElementById('routePanel');
  const panelHeader = panelEl?.querySelector('.route-panel-header');
  if (panelToggle && panelEl) {
    const togglePanel = () => {
      panelEl.classList.toggle('route-panel--collapsed');
    };
    panelToggle.addEventListener('click', (e) => { e.stopPropagation(); togglePanel(); });
    if (panelHeader) {
      panelHeader.addEventListener('click', (e) => {
        if (e.target.closest('.route-panel-content')) return;
        togglePanel();
      });
    }
  }

  initMapClickPicker();

  applyRouteLangText();
  updateLocationButton();

  updateRoutePanel();
}

function applyRouteLangText() {
  const tr = ROUTE_I18N[currentLang];
  if (!tr) return;

  const inputA = document.getElementById('routeInputA');
  const inputB = document.getElementById('routeInputB');
  if (inputA) inputA.placeholder = tr.placeholderA;
  if (inputB) inputB.placeholder = tr.placeholderB;

  const titleEl = document.querySelector('.route-panel-title');
  if (titleEl) titleEl.textContent = tr.safeRoute;

  const buildBtn = document.getElementById('routeBuildBtn');
  if (buildBtn) buildBtn.textContent = tr.buildRoute;

  const clearBtn = document.getElementById('routeClearBtn');
  if (clearBtn) clearBtn.textContent = tr.clearRoute;

  const locationBtn = document.getElementById('routeLocationBtn');
  if (locationBtn) {
    locationBtn.title = tr.useCurrentLocation;
    locationBtn.setAttribute('aria-label', tr.useCurrentLocation);
  }

  if (routeState.followsUserLocation) {
    const inputA = document.getElementById('routeInputA');
    if (inputA) inputA.value = tr.currentLocation;
    if (routeState.pointA) routeState.pointA.label = tr.currentLocation;
  }

  document.querySelectorAll('.route-pick-btn').forEach(btn => {
    btn.textContent = tr.pickOnMap;
  });
}

function waitForMapAndInit() {
  if (map && map.loaded()) {
    initRouteModule();
  } else if (map) {
    map.on('load', () => {
      initRouteModule();
    });
  } else {
    setTimeout(waitForMapAndInit, 100);
  }
}

if (document.readyState === 'complete') {
  waitForMapAndInit();
} else {
  window.addEventListener('load', waitForMapAndInit, { once: true });
}

const _origApplyTheme = typeof applyTheme === 'function' ? applyTheme : null;
if (_origApplyTheme) {
  const _patchedApplyTheme = function(theme) {
    _origApplyTheme(theme);
    if (routeState.active) {
      setTimeout(() => renderRouteOnMap(), 300);
    }
  };
  applyTheme = _patchedApplyTheme;
}

const _origSetLang = typeof setLang === 'function' ? setLang : null;
if (_origSetLang) {
  const _patchedSetLang = function(lang) {
    _origSetLang(lang);
    updateRoutePanel();
    applyRouteLangText();
    if (routeState.active) renderRouteOnMap();
  };
  setLang = _patchedSetLang;
}
