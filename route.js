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
  },
};

function rt(key) {
  const val = ROUTE_I18N[currentLang]?.[key];
  return val !== undefined ? val : key;
}

// ════════════════════════════════════════════════════════════════════════════
// CONFIG
// ════════════════════════════════════════════════════════════════════════════

const ROUTE_CONFIG = {
  geocodeUrl: `https://api.maptiler.com/geocoding`,
  directionsUrl: `https://router.project-osrm.org/route/v1/driving`,
  apiKey: MAPTILER_KEY,
  debounceMs: 350,
  proximity: [71.430, 51.128], // Astana center — bias geocoding results
  // Astana bounding box [west, south, east, north] — hard-restrict geocoding to city only
  cityBbox: [71.10, 50.95, 71.80, 51.30],
  country: 'kz',
  searchRadius: 300,           // meters — building proximity to route
  dangerLuxThreshold: 50000,   // lux — above this is considered dangerous
  sunAngleTolerance: 30,       // degrees — movement vs sun direction ±
  segmentChunkSize: 100,       // meters — chunk route into segments for coloring
  maxSuggestions: 6,
  cacheTTL: 5 * 60 * 1000,     // 5 min geocoding cache
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
};

// Geocoding cache: query → { results, timestamp }
const geocodeCache = new Map();

// ════════════════════════════════════════════════════════════════════════════
// GEOCODING — MapTiler Geocoding API with debounce + cache
// ════════════════════════════════════════════════════════════════════════════

function getCachedGeocode(query) {
  const cached = geocodeCache.get(query.toLowerCase());
  if (cached && Date.now() - cached.timestamp < ROUTE_CONFIG.cacheTTL) {
    return cached.results;
  }
  return null;
}

function setCachedGeocode(query, results) {
  geocodeCache.set(query.toLowerCase(), { results, timestamp: Date.now() });
}

async function geocodeSearch(query) {
  const trimmed = query.trim();
  if (trimmed.length < 2) return [];

  const cached = getCachedGeocode(trimmed);
  if (cached) return cached;

  const bbox = ROUTE_CONFIG.cityBbox.join(',');
  const url = `${ROUTE_CONFIG.geocodeUrl}/${encodeURIComponent(trimmed)}.json?key=${ROUTE_CONFIG.apiKey}` +
    `&autocomplete=true` +
    `&limit=${ROUTE_CONFIG.maxSuggestions}` +
    `&proximity=${ROUTE_CONFIG.proximity[0]},${ROUTE_CONFIG.proximity[1]}` +
    `&country=${ROUTE_CONFIG.country}` +
    `&bbox=${bbox}`;

  try {
    const resp = await fetch(url);
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const data = await resp.json();
    const [west, south, east, north] = ROUTE_CONFIG.cityBbox;
    // Defense-in-depth: even though we sent bbox to MapTiler, drop any result
    // whose coordinates fall outside Astana's bounding box.
    const results = (data.features || [])
      .map(f => {
        const streetLabel = f.address ? `${f.text} ${f.address}` : (f.text || '');
        const fullName = f.place_name || streetLabel || '';
        return {
          lng: f.center[0],
          lat: f.center[1],
          label: streetLabel || fullName,
          place: fullName,
        };
      })
      .filter(r => r.lng >= west && r.lng <= east && r.lat >= south && r.lat <= north);
    setCachedGeocode(trimmed, results);
    return results;
  } catch (err) {
    console.warn('[Geocode] Search failed:', err);
    return [];
  }
}

// ════════════════════════════════════════════════════════════════════════════
// ROUTING — MapTiler Directions API with alternatives
// ════════════════════════════════════════════════════════════════════════════

async function fetchRoutes(pointA, pointB) {
  const coords = `${pointA.lng},${pointA.lat};${pointB.lng},${pointB.lat}`;
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
// p, a, b are {lat, lng}
function pointToSegmentDist(p, a, b) {
  // Convert to local meters
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

// Format distance strictly in kilometers (расстояние в километрах)
function fmtKm(m) {
  const tr = ROUTE_I18N[currentLang];
  const km = m / 1000;
  // Show 2 decimals under 10 km for city-scale precision, else 1 decimal
  const val = km < 10 ? km.toFixed(2) : km.toFixed(1);
  return `${val} ${tr.km}`;
}

// Estimated time of arrival — current time + travel duration (примерное время прибытия)
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

// Compute visibility coefficient for a segment near a building.
// Considers: sun azimuth vs movement direction (±tolerance), building orientation,
// distance falloff, and current effective lux.
function computeVisibilityCoef(building, segStart, segEnd, sunAzimuth) {
  // Movement direction
  const moveBearing = bearing(segStart.lat, segStart.lng, segEnd.lat, segEnd.lng);

  // Sun vs movement direction: if driver is driving toward the sun, glare is worse
  const sunMoveDiff = angleDiff(moveBearing, sunAzimuth);

  // Within ±tolerance → full exposure; falloff outside
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

  // Building orientation factor: is the facade reflecting toward the road?
  let orientCoef = 1.0;
  if (building.orientation != null && building.orientation !== 0) {
    // Reflected glare goes roughly opposite to sun azimuth
    const reflectAz = (sunAzimuth + 180) % 360;
    const orientDiff = angleDiff(reflectAz, building.orientation);
    if (orientDiff < 30) orientCoef = 1.0;
    else if (orientDiff < 60) orientCoef = 0.6;
    else if (orientDiff < 90) orientCoef = 0.3;
    else orientCoef = 0.1;
  }

  return dirCoef * orientCoef;
}

// Estimate exposure time (seconds) for a segment given its length and assumed speed
function estimateExposureTime(segLengthM, routeDurationS, routeDistanceM) {
  if (routeDistanceM === 0) return 0;
  const avgSpeed = routeDistanceM / routeDurationS; // m/s
  return segLengthM / avgSpeed;
}

// Distance falloff: closer buildings contribute more
function distanceFalloff(distM, radius) {
  if (distM >= radius) return 0;
  // Linear falloff with a minimum floor
  return Math.max(0.1, 1 - distM / radius);
}

// Evaluate a single route: chunk into segments, compute risk per segment
function evaluateRoute(routeGeojson, durationS, distanceM) {
  const coords = routeGeojson.coordinates; // [[lng, lat], ...]
  const weatherMul = computeWeatherMultiplier();
  const sun = getSunPosition(new Date(), ASTANA.lat, ASTANA.lng);
  const sunAzimuth = sun.azimuth;
  const sunAltitude = sun.altitude;

  // If sun is below horizon, no glare risk at all
  const sunActive = sunAltitude > 0;

  // Chunk the route into segments of ~segmentChunkSize meters
  const segments = [];
  let currentSeg = { coords: [coords[0]], length: 0, riskScore: 0, nearbyBuildings: [] };

  for (let i = 1; i < coords.length; i++) {
    const prev = coords[i - 1];
    const curr = coords[i];
    const segLen = haversine(prev[1], prev[0], curr[1], curr[0]);

    currentSeg.coords.push(curr);
    currentSeg.length += segLen;

    if (currentSeg.length >= ROUTE_CONFIG.segmentChunkSize || i === coords.length - 1) {
      // Evaluate risk for this chunk
      if (sunActive) {
        const segStart = { lat: currentSeg.coords[0][1], lng: currentSeg.coords[0][0] };
        const segEnd = { lat: currentSeg.coords[currentSeg.coords.length - 1][1], lng: currentSeg.coords[currentSeg.coords.length - 1][0] };
        const segMid = {
          lat: (segStart.lat + segEnd.lat) / 2,
          lng: (segStart.lng + segEnd.lng) / 2,
        };

        let segRisk = 0;

        for (const b of buildings) {
          // Find minimum distance from building to any sub-segment within this chunk
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

      // Determine level
      // Use a per-segment risk threshold relative to segment length
      const riskPerMeter = currentSeg.length > 0 ? currentSeg.riskScore / currentSeg.length : 0;
      if (riskPerMeter > 500) currentSeg.level = 'danger';
      else if (riskPerMeter > 100) currentSeg.level = 'warning';
      else currentSeg.level = 'safe';

      segments.push(currentSeg);
      currentSeg = { coords: [curr], length: 0, riskScore: 0, nearbyBuildings: [] };
    }
  }

  // Sort nearby buildings by contribution within each segment
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

  routeState.loading = true;
  updateRoutePanel();

  try {
    const rawRoutes = await fetchRoutes(routeState.pointA, routeState.pointB);

    if (rawRoutes.length === 0) {
      showRouteError(rt('noRoute'));
      routeState.loading = false;
      updateRoutePanel();
      return;
    }

    // Evaluate each route
    const evaluated = rawRoutes.map(r =>
      evaluateRoute(r.geometry, r.duration, r.distance)
    );

    // Sort by risk score (lowest = safest)
    evaluated.sort((a, b) => a.totalRiskScore - b.totalRiskScore);

    routeState.routes = evaluated;
    routeState.selectedRouteIdx = 0;
    routeState.active = true;
    routeState.loading = false;

    renderRouteOnMap();
    updateRoutePanel();
  } catch (err) {
    console.error('[Route] Build failed:', err);
    showRouteError(rt('routeError'));
    routeState.loading = false;
    updateRoutePanel();
  }
}

function clearRoute() {
  routeState.pointA = null;
  routeState.pointB = null;
  routeState.routes = [];
  routeState.selectedRouteIdx = 0;
  routeState.active = false;
  routeState.loading = false;
  routeState.pickingFor = null;

  // Clear inputs
  const inputA = document.getElementById('routeInputA');
  const inputB = document.getElementById('routeInputB');
  if (inputA) inputA.value = '';
  if (inputB) inputB.value = '';

  // Remove map layers
  removeRouteLayers();

  // Remove markers
  if (routeState.markerA) { routeState.markerA.remove(); routeState.markerA = null; }
  if (routeState.markerB) { routeState.markerB.remove(); routeState.markerB = null; }

  // Reset map cursor
  if (map) map.getCanvas().style.cursor = '';

  updateRoutePanel();
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
  ['route-alt', 'route-safe', 'route-warning', 'route-danger', 'route-casing', 'route-points'].forEach(id => {
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

  // Build GeoJSON with per-segment features
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

  // Ghost lines for alternative (non-selected) routes — drawn UNDER the active route
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

    // Click a ghost alternative to select it
    map.on('click', 'route-alt', (e) => {
      const f = e.features && e.features[0];
      if (!f) return;
      const idx = f.properties.routeIdx;
      if (typeof idx === 'number' && idx !== routeState.selectedRouteIdx) {
        routeState.selectedRouteIdx = idx;
        renderRouteOnMap();
        updateRoutePanel();
      }
    });
    map.on('mouseenter', 'route-alt', () => { map.getCanvas().style.cursor = 'pointer'; });
    map.on('mouseleave', 'route-alt', () => { map.getCanvas().style.cursor = ''; });
  }

  // Casing layer (dark outline under colored segments)
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

  // Three colored layers filtered by level
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

  // Endpoint markers
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

  // Tooltip on hover for dangerous/warning segments
  const tooltipPopup = new maplibregl.Popup({
    offset: 16,
    closeButton: false,
    closeOnClick: false,
    maxWidth: '300px',
  });

  ['route-danger', 'route-warning'].forEach(layerId => {
    map.on('mouseenter', layerId, (e) => {
      map.getCanvas().style.cursor = 'pointer';
      const f = e.features && e.features[0];
      if (!f) return;
      const p = f.properties;
      const level = p.level;
      const levelLabel = level === 'danger' ? rt('segmentDanger') : rt('segmentWarning');

      let html = `<div class="route-tooltip">`;
      html += `<div class="route-tooltip-level route-tooltip-level--${level}">${levelLabel}</div>`;
      if (p.buildingName) {
        html += `<div class="route-tooltip-building">${rt('blindingBuilding')}: <strong>${p.buildingName}</strong></div>`;
        html += `<div class="route-tooltip-row"><span>${rt('luxAtBuilding')}</span><span>${Number(p.buildingLux).toLocaleString(tr.locale)} ${tr.luxUnit}</span></div>`;
        html += `<div class="route-tooltip-row"><span>${rt('distance')}</span><span>${p.buildingDist} ${tr.meters}</span></div>`;
        html += `<div class="route-tooltip-row"><span>${rt('exposureTime')}</span><span>${p.exposureTime}s</span></div>`;
        html += `<div class="route-tooltip-row"><span>${rt('visibilityCoef')}</span><span>${(p.visCoef).toFixed(2)}</span></div>`;
        html += `<div class="route-tooltip-reason">${rt('directionMatch')} (±${ROUTE_CONFIG.sunAngleTolerance}°)</div>`;
      } else {
        html += `<div class="route-tooltip-row">${rt('noRiskZones')}</div>`;
      }
      html += `</div>`;

      tooltipPopup.setHTML(html);
      tooltipPopup.setLngLat(e.lngLat).addTo(map);
    });

    map.on('mouseleave', layerId, () => {
      map.getCanvas().style.cursor = '';
      tooltipPopup.remove();
    });
  });

  // Fit bounds to include ALL routes (so alternatives are visible too)
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
  panel.innerHTML = '';
  return;
}
  const route = routeState.routes[routeState.selectedRouteIdx];
  const hasAlt = routeState.routes.length > 1;

  // Build comparison if alternatives exist
  let comparisonHTML = '';
  if (hasAlt) {
    comparisonHTML = `<div class="route-comparison">
      <h5>${tr.comparison} <span class="route-comparison-count">${tr.alternativesCount}: ${routeState.routes.length}</span></h5>
      <div class="route-comparison-grid">`;

    routeState.routes.forEach((r, i) => {
      const isSel = i === routeState.selectedRouteIdx;
      const label = i === 0 ? tr.bestRoute : `${tr.routeAlt} ${i}`;
      comparisonHTML += `
        <button class="route-comparison-card ${isSel ? 'route-comparison-card--active' : ''}" data-route-idx="${i}">
          <div class="route-comparison-label">${label}</div>
          <div class="route-comparison-stats">
            <span title="${tr.routeDistance}">📏 ${fmtKm(r.distance)}</span>
            <span title="${tr.routeDuration}">⏱ ${fmtDur(r.duration)}</span>
            <span title="${tr.eta}">🕒 ${fmtETA(r.duration)}</span>
          </div>
          <div class="route-comparison-risk">
            <span class="route-risk-dot route-risk-dot--${r.dangerZoneCount > 0 ? 'danger' : r.warningZoneCount > 0 ? 'warning' : 'safe'}"></span>
            ${tr.riskScore}: ${r.totalRiskScore.toLocaleString(tr.locale)}
          </div>
          <div class="route-comparison-zones">${tr.dangerZones}: ${r.dangerZoneCount}</div>
        </button>`;
    });

    comparisonHTML += `</div></div>`;
  }

  // Route summary
  const routeStatus = route.dangerZoneCount > 0 ? tr.routeHasRisks : (route.warningZoneCount > 0 ? tr.routeHasRisks : tr.routeSafe);
  const statusClass = route.dangerZoneCount > 0 ? 'danger' : (route.warningZoneCount > 0 ? 'warning' : 'safe');

  panel.innerHTML = `
    <div class="route-summary">
      <div class="route-status route-status--${statusClass}">
        <span class="route-status-dot"></span>
        ${routeStatus}
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
          <span class="route-stat-label">${tr.riskScore}</span>
          <span class="route-stat-value">${route.totalRiskScore.toLocaleString(tr.locale)}</span>
        </div>
      </div>
    </div>
    ${comparisonHTML}
  `;

  // Bind comparison card clicks
  panel.querySelectorAll('.route-comparison-card').forEach(card => {
    card.addEventListener('click', () => {
      const idx = parseInt(card.dataset.routeIdx);
      routeState.selectedRouteIdx = idx;
      renderRouteOnMap();
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

  input.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    const query = input.value.trim();

    if (query.length < 2) {
      suggBox.style.display = 'none';
      return;
    }

    debounceTimer = setTimeout(async () => {
      const results = await geocodeSearch(query);
      if (results.length === 0) {
        suggBox.style.display = 'none';
        return;
      }

      suggBox.innerHTML = results.map((r, i) =>
        `<div class="route-suggestion" data-idx="${i}">${r.place}</div>`
      ).join('');

      suggBox.style.display = 'block';

      // Store results for this input
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

          updateEndpointMarker(pointKey);
          tryBuildRoute();
        });
      });
    }, ROUTE_CONFIG.debounceMs);
  });

  input.addEventListener('blur', () => {
    // Delay to allow click on suggestion
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

  // Remove old marker
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

    const input = document.getElementById(inputId);
    if (input) input.value = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;

    updateEndpointMarker(pointKey);

    // Reset picking state
    routeState.pickingFor = null;
    map.getCanvas().style.cursor = '';

    // Update pick buttons
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
  // Create autocomplete inputs
  createAutocomplete('routeInputA', 'routeSuggestionsA', 'pointA');
  createAutocomplete('routeInputB', 'routeSuggestionsB', 'pointB');

  // Build button
  const buildBtn = document.getElementById('routeBuildBtn');
  if (buildBtn) {
    buildBtn.addEventListener('click', () => {
      if (routeState.pointA && routeState.pointB) {
        buildSafeRoute();
      }
    });
  }

  // Clear button
  const clearBtn = document.getElementById('routeClearBtn');
  if (clearBtn) {
    clearBtn.addEventListener('click', clearRoute);
  }

  // Pick on map buttons
  document.querySelectorAll('.route-pick-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.pick; // 'A' or 'B'

      if (routeState.pickingFor === target) {
        // Toggle off
        routeState.pickingFor = null;
        btn.classList.remove('route-pick-btn--active');
        if (map) map.getCanvas().style.cursor = '';
      } else {
        // Toggle on
        routeState.pickingFor = target;
        document.querySelectorAll('.route-pick-btn').forEach(b => {
          b.classList.toggle('route-pick-btn--active', b === btn);
        });
        if (map) map.getCanvas().style.cursor = 'crosshair';
      }
    });
  });

  // Panel collapse toggle
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
        // Only toggle when clicking the header area itself, not inputs
        if (e.target.closest('.route-panel-content')) return;
        togglePanel();
      });
    }
  }

  // Init map click picker
  initMapClickPicker();

  // Initial panel state
  updateRoutePanel();
}

// Initialize after map is loaded
const _origOnLoad = map ? map._listeners?.load : null;

// Hook into map load event
function waitForMapAndInit() {
  if (map && map.loaded()) {
    initRouteModule();
  } else if (map) {
    map.on('load', initRouteModule);
  } else {
    setTimeout(waitForMapAndInit, 100);
  }
}

// Start init when DOM is ready
if (document.readyState === 'complete') {
  waitForMapAndInit();
} else {
  window.addEventListener('load', waitForMapAndInit, { once: true });
}

// Re-render route on theme change
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

// Update route panel on language change
const _origSetLang = typeof setLang === 'function' ? setLang : null;
if (_origSetLang) {
  const _patchedSetLang = function(lang) {
    _origSetLang(lang);
    updateRoutePanel();
    // Update input placeholders
    const tr = ROUTE_I18N[currentLang];
    const inputA = document.getElementById('routeInputA');
    const inputB = document.getElementById('routeInputB');
    if (inputA) inputA.placeholder = tr.placeholderA;
    if (inputB) inputB.placeholder = tr.placeholderB;
    // Update static labels
    const titleEl = document.querySelector('.route-panel-title');
    if (titleEl) titleEl.textContent = tr.safeRoute;
    const buildBtn = document.getElementById('routeBuildBtn');
    if (buildBtn) buildBtn.textContent = tr.buildRoute;
    const clearBtn = document.getElementById('routeClearBtn');
    if (clearBtn) clearBtn.textContent = tr.clearRoute;
    document.querySelectorAll('.route-pick-btn').forEach(btn => {
      btn.textContent = tr.pickOnMap;
    });
    // Re-render route on map to update tooltips
    if (routeState.active) renderRouteOnMap();
  };
  setLang = _patchedSetLang;
}