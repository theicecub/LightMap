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
    collapseRoutePanel: 'Свернуть панель маршрута',
    expandRoutePanel: 'Развернуть панель маршрута',
    enterAddress: 'Ввести адрес',
    addressSearchPlaceholder: 'Введите адрес или место',
    addressSearchHint: 'Начните вводить адрес',
    addressSearchLoading: 'Ищем адреса…',
    addressSearchEmpty: 'Ничего не найдено',
    closeAddressSearch: 'Закрыть поиск',
    myLocation: 'Мое местоположение',
    chooseOnMap: 'Выбрать на карте',
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
    luxAtBuilding: 'Освещённость в глазу водителя',
    exposureTime: 'Время воздействия',
    visibilityCoef: 'Коэффициент видимости',
    directionMatch: 'Зеркальное отражение солнца направлено на водителя',
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
    collapseRoutePanel: 'Collapse route panel',
    expandRoutePanel: 'Expand route panel',
    enterAddress: 'Enter address',
    addressSearchPlaceholder: 'Enter an address or place',
    addressSearchHint: 'Start typing an address',
    addressSearchLoading: 'Searching addresses…',
    addressSearchEmpty: 'No places found',
    closeAddressSearch: 'Close search',
    myLocation: 'My location',
    chooseOnMap: 'Choose on map',
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
    luxAtBuilding: "Illuminance at driver's eye",
    exposureTime: 'Exposure time',
    visibilityCoef: 'Visibility coefficient',
    directionMatch: 'Specular sun reflection is aimed at the driver',
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
    collapseRoutePanel: 'Маршрут панелін жию',
    expandRoutePanel: 'Маршрут панелін ашу',
    enterAddress: 'Мекенжай енгізу',
    addressSearchPlaceholder: 'Мекенжайды немесе орынды енгізіңіз',
    addressSearchHint: 'Мекенжайды тере бастаңыз',
    addressSearchLoading: 'Мекенжайлар ізделуде…',
    addressSearchEmpty: 'Ештеңе табылмады',
    closeAddressSearch: 'Іздеуді жабу',
    myLocation: 'Менің орналасқан жерім',
    chooseOnMap: 'Картадан таңдау',
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
    luxAtBuilding: 'Жүргізуші көзіндегі жарықтану',
    exposureTime: 'Әсер ету уақыты',
    visibilityCoef: 'Көріну коэффициенті',
    directionMatch: 'Күннің айналық шағылысы жүргізушіге бағытталған',
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

const ROUTE_ICONS = {
  mapPin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M12 21.75s7.5-4.11 7.5-11.25a7.5 7.5 0 1 0-15 0c0 7.14 7.5 11.25 7.5 11.25Z" /><path stroke-linecap="round" stroke-linejoin="round" d="M14.25 10.5a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" /></svg>',
  distance: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="m7.5 21-4.5-4.5m0 0L7.5 12M3 16.5h18m0-9L16.5 3m4.5 4.5L16.5 12M21 7.5H3" /></svg>',
  clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m6.75 0a9.75 9.75 0 1 1-19.5 0 9.75 9.75 0 0 1 19.5 0Z" /></svg>',
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
  // totalRiskScore — суммарная «доза ослепления» (лк·с): освещённость в глазу
  // × время воздействия. Пороги: ~20 000 лк в течение 5 с = 100 000 лк·с
  // (опасно), ~5 000 лк в течение 4 с = 20 000 лк·с (внимание).
  if (route.dangerZoneCount > 0 || route.totalRiskScore > 100000) {
    return { label: rt('riskDanger'), level: 'danger' };
  }
  if (route.warningZoneCount > 0 || route.totalRiskScore > 20000) {
    return { label: rt('riskMedium'), level: 'warning' };
  }
  return { label: rt('riskSafe'), level: 'safe' };
}

// ════════════════════════════════════════════════════════════════════════════
// CONFIG
// ════════════════════════════════════════════════════════════════════════════

const ROUTE_CONFIG = {
  suggestUrl: '/api/2gis-suggest',
  directionsUrl: `https://router.project-osrm.org/route/v1/driving`,
  debounceMs: 350,
  proximity: [71.430, 51.128], // Astana center — bias geocoding results
  // Astana bounding box [west, south, east, north] — hard-restrict geocoding to city only
  cityBbox: [71.10, 50.95, 71.80, 51.30],
  searchRadius: 1200,          // meters — upper bound for candidate buildings near a route.
                               // The real reach is computed by tracing the specular ray
                               // against the facade plane (computeSpecularGlare), not a
                               // fixed radius.
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
const addressSearchState = {
  activeField: null,
  results: [],
  activeIndex: -1,
  debounceId: null,
  requestId: 0,
};

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
// GEOCODING — 2GIS Suggest API with debounce + cache
// ════════════════════════════════════════════════════════════════════════════

function expandGeocodeQueries(query) {
  const normalized = normalizeSearchText(query);
  const original = query.toLowerCase().trim();
  return !normalized || normalized === original ? [query] : [query, normalized];
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
        const detail = addressSearch
          ? (name && name !== label ? name : '')
          : (address && address !== label ? address : '');
        return {
          lng: item.point?.lon,
          lat: item.point?.lat,
          label,
          detail,
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

// Request a single OSRM route through an ordered list of {lng, lat} waypoints.
// Annotations give per-node travel durations so the sun position can be
// advanced along the route instead of being frozen at departure time.
async function fetchOsrmRoute(waypoints) {
  const coords = waypoints.map(p => `${p.lng},${p.lat}`).join(';');
  const url = `${ROUTE_CONFIG.directionsUrl}/${coords}` +
    `?alternatives=true` +
    `&steps=true` +
    `&geometries=geojson` +
    `&overview=full` +
    `&annotations=duration`;

  try {
    const resp = await fetch(url);
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const data = await resp.json();
    if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) return [];
    return data.routes.map(r => ({
      ...r,
      nodeDurations: r.legs?.[0]?.annotation?.duration ?? null,
    }));
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

// Наблюдательная геометрия блика для конкретного водителя на конкретном
// сегменте. Строит цепочку «Солнце → фасад → отражённый луч → глаз водителя»
// через computeSpecularGlare (3D-трассировка), плюс поле зрения: взгляд
// водителя аппроксимируется направлением движения (глаза следуют за дорогой).
//   segStart/segEnd — концы сегмента; sunAlt/sunAz — Солнце на этом сегменте.
// Возвращает { factor, dist }: factor — доля пикового блика, дошедшая до глаз.
function computeDriverGlareCoef(building, segStart, segEnd, sunAlt, sunAz) {
  const moveBearing = bearing(segStart.lat, segStart.lng, segEnd.lat, segEnd.lng);
  const midLat = (segStart.lat + segEnd.lat) / 2;
  const midLng = (segStart.lng + segEnd.lng) / 2;

  // Смещение глаз водителя относительно здания в локальных метрах (ENU).
  const eyeEastM = (midLng - building.lng) * metersPerDegLng(building.lat);
  const eyeNorthM = (midLat - building.lat) * METERS_PER_DEG_LAT;

  // Поле зрения: зрачок направлен по курсу движения. Блик в центре обзора
  // опаснее, чем в периферии; позади — только через зеркала.
  const toBuilding = bearing(midLat, midLng, building.lat, building.lng);
  const lookDiff = angleDiff(moveBearing, toBuilding);
  let fovCoef;
  if (lookDiff <= 45) fovCoef = 1;
  else if (lookDiff <= 90) fovCoef = 0.5;
  else if (lookDiff <= 135) fovCoef = 0.1;
  else fovCoef = 0.02;

  const normals = getFacadeNormals(building);
  const isOmni = building.omnidirectional === true || normals.length === 0;

  if (isOmni) {
    // Сфера/конус/пирамида: нет единой плоскости стекла. Приближение —
    // рассеянная засветка + слабое зеркальное пятно, когда солнце находится
    // «за спиной» водителя (направление на солнце близко к направлению
    // «водитель → здание»).
    const toDriver = bearing(building.lat, building.lng, midLat, midLng);
    const sunDriverDiff = angleDiff(sunAz, toDriver);
    const alignment = Math.max(0, Math.cos(sunDriverDiff * Math.PI / 180));
    const factor = DIFFUSE_GLARE_FLOOR + 0.45 * alignment;
    return { factor: factor * fovCoef, dist: Math.hypot(eyeEastM, eyeNorthM) };
  }

  const ray = computeSpecularGlare(building, sunAlt, sunAz, eyeEastM, eyeNorthM);
  return { factor: ray.factor * fovCoef, dist: ray.dist, incidence: ray.incidence };
}

function estimateExposureTime(segLengthM, routeDurationS, routeDistanceM) {
  if (routeDistanceM === 0) return 0;
  const avgSpeed = routeDistanceM / routeDurationS;
  return segLengthM / avgSpeed;
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

// Оценка риска маршрута. Солнце пересчитывается для каждого сегмента по
// времени его проезда (для длинных поездок оно заметно смещается), а итог —
// физические величины: пиковая освещённость в глазу водителя (лк) и «доза
// ослепления» (лк·с = освещённость × время воздействия).
//   routeGeojson — GeoJSON LineString с .coordinates;
//   durationS/distanceM — общее время (с) и длина (м) маршрута;
//   nodeDurationsSec — поточечные длительности OSRM (annotation.duration)
//                      или null (равномерное распределение времени);
//   startTimeMs — момент выезда (по умолчанию «сейчас»).
function evaluateRoute(routeGeojson, durationS, distanceM, nodeDurationsSec, startTimeMs) {
  const coords = routeGeojson.coordinates;
  if (!coords || coords.length < 2) {
    return {
      segments: [], totalRiskScore: 0, dangerZoneCount: 0, warningZoneCount: 0,
      distance: distanceM, duration: durationS, coordinates: coords || [],
    };
  }
  const weatherMul = computeWeatherMultiplier();
  const start = Number.isFinite(startTimeMs) ? startTimeMs : Date.now();
  const n = coords.length;

  // Время проезда каждой точки маршрута — чтобы Солнце эволюционировало
  // вдоль маршрута, а не замирало в момент выезда.
  const timesMs = new Array(n);
  timesMs[0] = start;
  const hasNodeDurations = Array.isArray(nodeDurationsSec) && nodeDurationsSec.length >= n - 1;
  const uniformStepMs = (durationS * 1000) / (n - 1);
  for (let i = 1; i < n; i++) {
    const dt = hasNodeDurations ? (Number(nodeDurationsSec[i - 1]) || 0) * 1000 : uniformStepMs;
    timesMs[i] = timesMs[i - 1] + dt;
  }

  const segments = [];
  let currentSeg = {
    coords: [coords[0]], startIdx: 0, endIdx: 0, length: 0,
    riskScore: 0, dose: 0, peakLux: 0, nearbyBuildings: [],
  };

  for (let i = 1; i < n; i++) {
    const prev = coords[i - 1];
    const curr = coords[i];
    const segLen = haversine(prev[1], prev[0], curr[1], curr[0]);

    currentSeg.coords.push(curr);
    currentSeg.endIdx = i;
    currentSeg.length += segLen;

    if (currentSeg.length >= ROUTE_CONFIG.segmentChunkSize || i === n - 1) {
      const segStart = { lat: currentSeg.coords[0][1], lng: currentSeg.coords[0][0] };
      const segEnd = {
        lat: currentSeg.coords[currentSeg.coords.length - 1][1],
        lng: currentSeg.coords[currentSeg.coords.length - 1][0],
      };

      // Солнце в момент проезда СЕРЕДИНЫ сегмента.
      const midIdx = currentSeg.startIdx + Math.floor((currentSeg.endIdx - currentSeg.startIdx) / 2);
      const midTime = timesMs[midIdx];
      const sun = getSunPosition(new Date(midTime), ASTANA.lat, ASTANA.lng);
      const sunAzimuth = sun.azimuth;
      const sunAltitude = sun.altitude;

      let segDose = 0;
      let segPeakLux = 0;

      if (sunAltitude > 0) {
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
          if (minDist >= ROUTE_CONFIG.searchRadius) continue;

          // Вне сезонного окна опасности здание не бликует.
          if (!isBuildingGlareActive(b, new Date(midTime))) continue;

          // Геометрия наблюдателя: попадает ли отражённый луч в глаз водителя.
          const glare = computeDriverGlareCoef(b, segStart, segEnd, sunAltitude, sunAzimuth);
          if (glare.factor <= 0) continue;

          // Геометрия «Солнце → фасад».
          let solarFactor;
          if (b.omnidirectional === true || getFacadeNormals(b).length === 0) {
            solarFactor = solarGlareFactor(sunAltitude, 90 - sunAltitude);
          } else {
            const inc = glare.incidence != null ? glare.incidence : (90 - sunAltitude);
            solarFactor = solarGlareFactor(sunAltitude, inc);
          }
          if (solarFactor <= 0) continue;

          // Освещённость в глазу водителя (лк) — итог полной оптической цепочки.
          const eyeLux = computeEyeIlluminance(b, weatherMul, solarFactor, glare.factor, glare.dist);
          if (eyeLux <= 0) continue;

          const exposureTime = estimateExposureTime(currentSeg.length, durationS, distanceM);
          const contribution = eyeLux * exposureTime; // лк·с — доза ослепления

          segDose += contribution;
          if (eyeLux > segPeakLux) segPeakLux = eyeLux;

          currentSeg.nearbyBuildings.push({
            building: b,
            distance: Math.round(glare.dist != null ? glare.dist : minDist),
            lux: Math.round(eyeLux),
            exposureTime: Math.round(exposureTime),
            visibilityCoef: glare.factor,
            falloff: Math.exp(-(glare.dist || 0) / 10000),
            contribution: Math.round(contribution),
          });
        }
      }

      currentSeg.riskScore = Math.round(segDose);
      currentSeg.dose = segDose;
      currentSeg.peakLux = segPeakLux;

      // Уровень сегмента — по ПИКОВОЙ освещённости в глазу (физический порог):
      // 20 000 лк — сопоставимо с прямым взглядом на низкое солнце (опасно),
      // 5 000 лк — заметное ослепление (внимание).
      if (segPeakLux >= 20000) currentSeg.level = 'danger';
      else if (segPeakLux >= 5000) currentSeg.level = 'warning';
      else currentSeg.level = 'safe';

      segments.push(currentSeg);
      currentSeg = {
        coords: [curr], startIdx: i, endIdx: i, length: 0,
        riskScore: 0, dose: 0, peakLux: 0, nearbyBuildings: [],
      };
    }
  }

  segments.forEach(s => {
    s.nearbyBuildings.sort((a, b) => b.contribution - a.contribution);
  });

  const totalDose = segments.reduce((sum, s) => sum + s.dose, 0);
  const dangerZones = segments.filter(s => s.level === 'danger').length;
  const warningZones = segments.filter(s => s.level === 'warning').length;

  return {
    segments,
    totalRiskScore: Math.round(totalDose), // доза ослепления, лк·с
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
      evaluateRoute(r.geometry, r.duration, r.distance, r.nodeDurations, Date.now())
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

  const fieldValueA = document.getElementById('routeFieldValueA');
  const fieldValueB = document.getElementById('routeFieldValueB');
  if (fieldValueA) fieldValueA.textContent = '';
  if (fieldValueB) fieldValueB.textContent = '';

  removeRouteLayers();

  if (routeState.markerA) { routeState.markerA.remove(); routeState.markerA = null; }
  if (routeState.markerB) { routeState.markerB.remove(); routeState.markerB = null; }

  if (map) map.getCanvas().style.cursor = '';

  updateRoutePanel();
}


// ════════════════════════════════════════════════════════════════════════════
// MAP VISUALIZATION
// ════════════════════════════════════════════════════════════════════════════

function getCurrentZoneLevel() {
  const position = routeState.userPosition;
  if (!position) return null;

  // Зоны зданий доступны и до выбора точки назначения. Достаёт ли отражённый
  // луч до глаз водителя, определяется трассировкой луча (computeSpecularGlare)
  // с учётом высоты фасада и высоты солнца — радиус не фиксирован.
  const sun = getSunPosition(new Date(), ASTANA.lat, ASTANA.lng);
  let warningFound = false;
  if (sun.altitude > 0) {
    for (const building of buildings) {
      if (building.level !== 'danger' && building.level !== 'warning') continue;
      const eyeEastM = (position.lng - building.lng) * metersPerDegLng(building.lat);
      const eyeNorthM = (position.lat - building.lat) * METERS_PER_DEG_LAT;

      let glare;
      const normals = getFacadeNormals(building);
      if (building.omnidirectional === true || normals.length === 0) {
        const dist = Math.hypot(eyeEastM, eyeNorthM);
        const reach = (facadeHeightM(building) - DRIVER_EYE_HEIGHT_M) /
          Math.tan(sun.altitude * Math.PI / 180);
        glare = reach > 0 && dist <= reach * 1.1 ? { factor: DIFFUSE_GLARE_FLOOR + 0.45 } : { factor: 0 };
      } else {
        glare = computeSpecularGlare(building, sun.altitude, sun.azimuth, eyeEastM, eyeNorthM);
      }

      if (glare.factor > 0.05) {
        if (building.level === 'danger') return 'danger';
        warningFound = true;
      }
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

  const fieldValueA = document.getElementById('routeFieldValueA');
  if (fieldValueA) fieldValueA.textContent = rt('currentLocation');
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
  if (previousLevel !== routeState.currentZoneLevel) {
    updateRoutePanel();
    if (routeState.currentZoneLevel) playGlareWarning();
  }
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
        ? getLocalizedBuildingLabel(seg.nearbyBuildings[0].building, seg.nearbyBuildings[0].building.name)
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
      html += `<div class="route-tooltip-building">${escapeHtml(rt('blindingBuilding'))}: <strong>${escapeHtml(p.buildingName)}</strong></div>`;
      html += `<div class="route-tooltip-row"><span>${rt('luxAtBuilding')}</span><span>${Number(p.buildingLux).toLocaleString(tr.locale)} ${tr.luxUnit}</span></div>`;
      html += `<div class="route-tooltip-row"><span>${rt('distance')}</span><span>${p.buildingDist} ${tr.meters}</span></div>`;
      html += `<div class="route-tooltip-row"><span>${rt('exposureTime')}</span><span>${p.exposureTime}s</span></div>`;
      html += `<div class="route-tooltip-row"><span>${rt('visibilityCoef')}</span><span>${visStatus.label}</span></div>`;
      html += `<div class="route-tooltip-reason">${rt('directionMatch')}</div>`;
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
  const resultsContainer = document.getElementById('routeResults');
  if (!panel) return;

  const tr = ROUTE_I18N[currentLang];

  if (routeState.loading) {
    panel.innerHTML = `<div class="route-loading"><span class="route-spinner"></span>${rt('loading')}</div>`;
    if (resultsContainer) resultsContainer.style.display = 'flex';
    return;
  }

  if (!routeState.active || routeState.routes.length === 0) {
    panel.innerHTML = routeState.currentZoneLevel
      ? `<div class="route-location-alert route-location-alert--${routeState.currentZoneLevel}">
          ${routeState.currentZoneLevel === 'danger' ? rt('inDangerZone') : rt('inWarningZone')}
        </div>`
      : '';
    if (resultsContainer) resultsContainer.style.display = routeState.currentZoneLevel ? 'flex' : 'none';
    return;
  }

  if (resultsContainer) resultsContainer.style.display = 'flex';

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
            <span title="${tr.routeDistance}"><i class="route-comparison-stat-icon">${ROUTE_ICONS.distance}</i>${fmtKm(r.distance)}</span>
            <span title="${tr.routeDuration}"><i class="route-comparison-stat-icon">${ROUTE_ICONS.clock}</i>${fmtDur(r.duration)}</span>
            <span title="${tr.eta}"><i class="route-comparison-stat-icon">${ROUTE_ICONS.clock}</i>${fmtETA(r.duration)}</span>
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
    const field = routeState.pickingFor;

    setPoint(field, {
      lng,
      lat,
      label: `${lat.toFixed(5)}, ${lng.toFixed(5)}`,
    });

    routeState.pickingFor = null;
    map.getCanvas().style.cursor = '';
  });
}

// ════════════════════════════════════════════════════════════════════════════
// INITIALIZATION
// ════════════════════════════════════════════════════════════════════════════

function initRouteModule() {
  // Initialize field buttons and menus
  initFieldMenus();
  initRoutePanelKeyboardAvoidance();

  // Build button
  const buildBtn = document.getElementById('routeBuildBtn');
  if (buildBtn) {
    buildBtn.addEventListener('click', () => {
      enableGlareAudio();
      if (routeState.pointA && routeState.pointB) {
        buildSafeRoute();
      }
    });
  }

  const panelToggle = document.getElementById('routePanelToggle');
  if (panelToggle) {
    // Set initial arrow state: down when open
    const toggleIcon = panelToggle.querySelector('svg');
    if (toggleIcon) {
      toggleIcon.style.transform = 'rotate(180deg)';
    }

    panelToggle.addEventListener('click', () => {
      const panel = document.getElementById('routePanel');
      if (!panel) return;

      const nextCollapsed = !panel.classList.contains('route-panel--collapsed');
      panel.classList.toggle('route-panel--collapsed', nextCollapsed);

      const toggleIcon = panelToggle.querySelector('svg');
      if (toggleIcon) {
        toggleIcon.style.transform = nextCollapsed ? 'rotate(0deg)' : 'rotate(180deg)';
      }

      const toggleLabel = rt(nextCollapsed ? 'expandRoutePanel' : 'collapseRoutePanel');
      panelToggle.setAttribute('aria-label', toggleLabel);
      panelToggle.setAttribute('title', toggleLabel);
      panelToggle.setAttribute('aria-expanded', String(!nextCollapsed));
    });
  }

  // Clear buttons
  const clearA = document.getElementById('routeClearA');
  const clearB = document.getElementById('routeClearB');
  if (clearA) clearA.addEventListener('click', () => clearPoint('A'));
  if (clearB) clearB.addEventListener('click', () => clearPoint('B'));

  initMapClickPicker();
  applyRouteLangText();
  updateRoutePanel();
}

// On iOS browsers the virtual keyboard may overlay the layout viewport instead
// of resizing it. Keep the route panel directly above that overlay.
function initRoutePanelKeyboardAvoidance() {
  const panel = document.getElementById('routePanel');
  if (!panel || panel.dataset.keyboardAvoidanceReady === 'true') return;

  panel.dataset.keyboardAvoidanceReady = 'true';
  const updatePanelOffset = () => {
    const viewport = window.visualViewport;
    if (!viewport) return;

    const overlayHeight = Math.max(0, window.innerHeight - viewport.height - viewport.offsetTop);
    // Small changes are browser chrome, not the on-screen keyboard.
    const keyboardHeight = overlayHeight > 100 ? Math.round(overlayHeight) : 0;
    panel.style.setProperty('--route-keyboard-offset', `${keyboardHeight}px`);
    panel.classList.toggle('route-panel--above-keyboard', keyboardHeight > 0);
  };

  window.visualViewport?.addEventListener('resize', updatePanelOffset);
  window.visualViewport?.addEventListener('scroll', updatePanelOffset);
  window.addEventListener('resize', updatePanelOffset);
  document.addEventListener('focusin', updatePanelOffset);
  document.addEventListener('focusout', () => window.setTimeout(updatePanelOffset, 150));
  updatePanelOffset();
}

function initFieldMenus() {
  ['A', 'B'].forEach(field => {
    const inputBtn = document.getElementById(field === 'A' ? 'routeInputABtn' : 'routeInputBBtn');
    const menu = document.getElementById(`routeFieldMenu${field}`);

    if (!inputBtn || !menu) return;

    initAddressSearch(field);

    // Toggle menu on button click
    inputBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      closeAllAddressSearches();
      const allMenus = document.querySelectorAll('.route-field-menu');
      allMenus.forEach(m => {
        if (m !== menu) m.classList.remove('active');
      });
      menu.classList.toggle('active');
    });

    // Menu item clicks
    menu.querySelectorAll('.route-menu-item').forEach(item => {
      item.addEventListener('click', (e) => {
        e.stopPropagation();
        const action = item.dataset.action;
        const itemField = item.dataset.field;

        if (action === 'address') {
          openAddressInput(itemField);
        } else if (action === 'geolocation') {
          useGeolocation(itemField);
        } else if (action === 'map') {
          startMapPicker(itemField);
        }

        menu.classList.remove('active');
      });
    });
  });

  // Close menus on outside click
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.route-input-field')) {
      document.querySelectorAll('.route-field-menu.active').forEach(m => {
        m.classList.remove('active');
      });
      closeAllAddressSearches();
    }
  });
}

function openAddressInput(field) {
  const search = document.getElementById(`routeAddressSearch${field}`);
  const input = document.getElementById(`routeAddressInput${field}`);
  if (!search || !input) return;

  document.querySelectorAll('.route-field-menu.active').forEach(menu => menu.classList.remove('active'));
  closeAllAddressSearches(field);

  const existingPoint = routeState[field === 'A' ? 'pointA' : 'pointB'];
  input.value = existingPoint?.label || '';
  search.hidden = false;
  addressSearchState.activeField = field;
  addressSearchState.results = [];
  addressSearchState.activeIndex = -1;
  renderAddressSearch(field, [], input.value.trim().length < 2 ? 'hint' : 'loading');

  window.setTimeout(() => {
    input.focus({ preventScroll: true });
    if (input.value) input.select();
    if (input.value.trim().length >= 2) queueAddressSearch(field);
  }, 0);
}

function initAddressSearch(field) {
  const search = document.getElementById(`routeAddressSearch${field}`);
  const input = document.getElementById(`routeAddressInput${field}`);
  const closeButton = search?.querySelector('[data-close-address-search]');
  if (!search || !input || input.dataset.addressSearchReady === 'true') return;

  input.dataset.addressSearchReady = 'true';
  input.addEventListener('input', () => queueAddressSearch(field));
  input.addEventListener('keydown', event => handleAddressSearchKeydown(field, event));
  closeButton?.addEventListener('click', () => closeAddressSearch(field, true));
}

function closeAllAddressSearches(exceptField = null) {
  ['A', 'B'].forEach(field => {
    if (field !== exceptField) closeAddressSearch(field);
  });
}

function closeAddressSearch(field, returnFocus = false) {
  const search = document.getElementById(`routeAddressSearch${field}`);
  if (!search || search.hidden) return;

  search.hidden = true;
  addressSearchState.requestId += 1;
  if (addressSearchState.debounceId) window.clearTimeout(addressSearchState.debounceId);
  addressSearchState.debounceId = null;
  if (addressSearchState.activeField === field) {
    addressSearchState.activeField = null;
    addressSearchState.results = [];
    addressSearchState.activeIndex = -1;
  }

  if (returnFocus) {
    document.getElementById(field === 'A' ? 'routeInputABtn' : 'routeInputBBtn')?.focus();
  }
}

function queueAddressSearch(field) {
  const input = document.getElementById(`routeAddressInput${field}`);
  const search = document.getElementById(`routeAddressSearch${field}`);
  if (!input || !search || search.hidden || addressSearchState.activeField !== field) return;

  const query = input.value.trim();
  addressSearchState.requestId += 1;
  const requestId = addressSearchState.requestId;
  if (addressSearchState.debounceId) window.clearTimeout(addressSearchState.debounceId);

  if (query.length < 2) {
    addressSearchState.results = [];
    addressSearchState.activeIndex = -1;
    renderAddressSearch(field, [], 'hint');
    return;
  }

  renderAddressSearch(field, [], 'loading');
  addressSearchState.debounceId = window.setTimeout(async () => {
    try {
      const results = await geocodeSearch(query);
      if (!isCurrentAddressSearch(field, query, requestId)) return;
      addressSearchState.results = results;
      addressSearchState.activeIndex = -1;
      renderAddressSearch(field, results, results.length ? 'results' : 'empty');
    } catch (error) {
      console.warn('[Address search] Failed to load suggestions:', error);
      if (isCurrentAddressSearch(field, query, requestId)) renderAddressSearch(field, [], 'empty');
    }
  }, ROUTE_CONFIG.debounceMs);
}

function isCurrentAddressSearch(field, query, requestId) {
  const search = document.getElementById(`routeAddressSearch${field}`);
  const input = document.getElementById(`routeAddressInput${field}`);
  return addressSearchState.activeField === field && !search?.hidden &&
    input?.value.trim() === query && addressSearchState.requestId === requestId;
}

function renderAddressSearch(field, results, state) {
  const input = document.getElementById(`routeAddressInput${field}`);
  const status = document.getElementById(`routeAddressStatus${field}`);
  const suggestions = document.getElementById(`routeAddressSuggestions${field}`);
  if (!input || !status || !suggestions) return;

  const tr = ROUTE_I18N[currentLang] || ROUTE_I18N.ru;
  status.textContent = state === 'hint' ? tr.addressSearchHint :
    state === 'loading' ? tr.addressSearchLoading :
      state === 'empty' ? tr.addressSearchEmpty : '';
  suggestions.replaceChildren();
  input.setAttribute('aria-expanded', String(results.length > 0));
  input.removeAttribute('aria-activedescendant');

  results.forEach((result, index) => {
    const option = document.createElement('button');
    option.type = 'button';
    option.className = 'route-address-suggestion';
    option.id = `routeAddressOption${field}${index}`;
    option.setAttribute('role', 'option');
    option.setAttribute('aria-selected', 'false');

    const pin = document.createElement('span');
    pin.className = 'route-address-suggestion__pin';
    pin.setAttribute('aria-hidden', 'true');
    pin.textContent = '⌖';
    const text = document.createElement('span');
    text.className = 'route-address-suggestion__text';
    const label = document.createElement('span');
    label.className = 'route-address-suggestion__label';
    label.textContent = result.label;
    text.append(label);
    if (result.detail) {
      const detail = document.createElement('span');
      detail.className = 'route-address-suggestion__detail';
      detail.textContent = result.detail;
      text.append(detail);
    }
    option.append(pin, text);
    option.addEventListener('click', () => selectAddressSuggestion(field, index));
    suggestions.append(option);
  });
}

function handleAddressSearchKeydown(field, event) {
  if (event.key === 'Escape') {
    event.preventDefault();
    closeAddressSearch(field, true);
    return;
  }

  const count = addressSearchState.results.length;
  if (!count || addressSearchState.activeField !== field) return;
  if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
    event.preventDefault();
    const shift = event.key === 'ArrowDown' ? 1 : -1;
    const nextIndex = addressSearchState.activeIndex < 0
      ? (shift > 0 ? 0 : count - 1)
      : (addressSearchState.activeIndex + shift + count) % count;
    setAddressSuggestionActive(field, nextIndex);
  } else if (event.key === 'Enter' && addressSearchState.activeIndex >= 0) {
    event.preventDefault();
    selectAddressSuggestion(field, addressSearchState.activeIndex);
  }
}

function setAddressSuggestionActive(field, index) {
  addressSearchState.activeIndex = index;
  const input = document.getElementById(`routeAddressInput${field}`);
  document.querySelectorAll(`#routeAddressSuggestions${field} .route-address-suggestion`).forEach((option, optionIndex) => {
    const isActive = optionIndex === index;
    option.classList.toggle('is-active', isActive);
    option.setAttribute('aria-selected', String(isActive));
    if (isActive) {
      input?.setAttribute('aria-activedescendant', option.id);
      option.scrollIntoView({ block: 'nearest' });
    }
  });
}

function selectAddressSuggestion(field, index) {
  const result = addressSearchState.results[index];
  if (!result) return;
  selectPointFromGeocoding(field, result);
  closeAddressSearch(field);
}

function useGeolocation(field) {
  enableGlareAudio();
  if (!navigator.geolocation) {
    alert('Геолокация не поддерживается вашим браузером');
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude: lat, longitude: lng } = position.coords;
      setPoint(field, { lng, lat, label: '📍 Мое местоположение' });
      if (field === 'A') routeState.followsUserLocation = true;
    },
    (error) => {
      const tr = ROUTE_I18N[currentLang];
      let message = tr.locationUnavailable;
      if (error.code === 1) message = tr.locationDenied;
      if (error.code === 3) message = tr.locationAccuracyPoor;
      alert(message);
    }
  );
}

function startMapPicker(field) {
  routeState.pickingFor = field;
  if (map) map.getCanvas().style.cursor = 'crosshair';
}

function selectPointFromGeocoding(field, result) {
  setPoint(field, { lng: result.lng, lat: result.lat, label: result.label });
  if (field === 'A') routeState.followsUserLocation = false;
}

function setPoint(field, point) {
  const pointKey = field === 'A' ? 'pointA' : 'pointB';
  const fieldValueId = field === 'A' ? 'routeFieldValueA' : 'routeFieldValueB';

  routeState[pointKey] = point;

  const fieldValue = document.getElementById(fieldValueId);
  if (fieldValue) {
    fieldValue.textContent = point.label;
  }

  updateEndpointMarker(pointKey);
  tryBuildRoute();
}

function clearPoint(field) {
  const pointKey = field === 'A' ? 'pointA' : 'pointB';
  const fieldValueId = field === 'A' ? 'routeFieldValueA' : 'routeFieldValueB';
  const markerKey = field === 'A' ? 'markerA' : 'markerB';

  routeState[pointKey] = null;
  routeState.buildRequestId += 1;
  routeState.routes = [];
  routeState.selectedRouteIdx = 0;
  routeState.active = false;
  routeState.loading = false;
  routeState.currentZoneLevel = null;
  routeState.followsUserLocation = false;

  const fieldValue = document.getElementById(fieldValueId);
  if (fieldValue) {
    fieldValue.textContent = '';
  }

  if (routeState[markerKey]) {
    routeState[markerKey].remove();
    routeState[markerKey] = null;
  }

  removeRouteLayers();
  if (map) map.getCanvas().style.cursor = '';
  updateRoutePanel();
}

function applyRouteLangText() {
  const tr = ROUTE_I18N[currentLang];
  if (!tr) return;

  // Update button labels
  const inputABtn = document.getElementById('routeInputABtn');
  const inputBBtn = document.getElementById('routeInputBBtn');
  const buildBtn = document.getElementById('routeBuildBtn');
  const panelToggle = document.getElementById('routePanelToggle');

  if (inputABtn) {
    const label = inputABtn.querySelector('.route-field-label');
    if (label) label.textContent = tr.placeholderA || 'Откуда';
  }

  if (inputBBtn) {
    const label = inputBBtn.querySelector('.route-field-label');
    if (label) label.textContent = tr.placeholderB || 'Куда';
  }

  // Update menu item labels
  ['A', 'B'].forEach(field => {
    const menu = document.getElementById(`routeFieldMenu${field}`);
    if (menu) {
      const items = menu.querySelectorAll('.route-menu-item');
      if (items[0]) {
        items[0].querySelector('span').textContent = tr.enterAddress;
        items[0].title = tr.enterAddress;
      }
      if (items[1]) {
        items[1].querySelector('span').textContent = tr.myLocation;
        items[1].title = tr.myLocation;
      }
      if (items[2]) {
        items[2].querySelector('span').textContent = tr.chooseOnMap;
        items[2].title = tr.chooseOnMap;
      }
    }

    const input = document.getElementById(`routeAddressInput${field}`);
    const search = document.getElementById(`routeAddressSearch${field}`);
    const closeButton = search?.querySelector('[data-close-address-search]');
    if (input) input.placeholder = tr.addressSearchPlaceholder;
    if (search) search.setAttribute('aria-label', tr.enterAddress);
    if (closeButton) {
      closeButton.setAttribute('aria-label', tr.closeAddressSearch);
      closeButton.title = tr.closeAddressSearch;
    }
  });

  if (buildBtn) buildBtn.title = tr.buildRoute || 'Построить маршрут';
  if (buildBtn) buildBtn.setAttribute('aria-label', tr.buildRoute || 'Построить маршрут');

  if (panelToggle) {
    const panel = document.getElementById('routePanel');
    const isCollapsed = panel?.classList.contains('route-panel--collapsed');
    const toggleLabel = tr[isCollapsed ? 'expandRoutePanel' : 'collapseRoutePanel'] || 'Свернуть панель маршрута';
    panelToggle.setAttribute('aria-label', toggleLabel);
    panelToggle.setAttribute('title', toggleLabel);
  }
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
  const _patchedApplyTheme = function (theme) {
    _origApplyTheme(theme);
    if (routeState.active) {
      setTimeout(() => renderRouteOnMap(), 300);
    }
  };
  applyTheme = _patchedApplyTheme;
}

const _origSetLang = typeof setLang === 'function' ? setLang : null;
if (_origSetLang) {
  const _patchedSetLang = function (lang) {
    _origSetLang(lang);
    updateRoutePanel();
    applyRouteLangText();
    if (routeState.active) renderRouteOnMap();
  };
  setLang = _patchedSetLang;
}
