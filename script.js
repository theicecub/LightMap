// ═══════════════════════════════════════════════════════════════
//  LightMap — Световые блики Астаны
//  Опасность точек зависит от времени суток + погоды (Open-Meteo)
// ═══════════════════════════════════════════════════════════════

const MAPTILER_KEY = 'JBWS7gL5h6Ob9ya2vfNO';
const MAP_STYLE = {
  dark:  `https://api.maptiler.com/maps/streets-v4-dark/style.json?key=${MAPTILER_KEY}`,
  light: `https://api.maptiler.com/maps/streets-v4/style.json?key=${MAPTILER_KEY}`,
};

function readStoredTheme() {
  try {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light' || savedTheme === 'dark') return savedTheme;
  } catch (err) {
    console.warn('[Theme] Could not read localStorage:', err);
  }

  const attrTheme = document.documentElement.getAttribute('data-theme');
  if (attrTheme === 'light' || attrTheme === 'dark') return attrTheme;

  return 'dark';
}

function writeStoredTheme(theme) {
  try {
    localStorage.setItem('theme', theme);
  } catch (err) {
    console.warn('[Theme] Could not save localStorage:', err);
  }
}

const initialTheme = readStoredTheme();
const rootEl = document.documentElement;

function syncThemeState(theme) {
  const resolvedTheme = theme === 'light' ? 'light' : 'dark';
  rootEl.setAttribute('data-theme', resolvedTheme);
  rootEl.style.colorScheme = resolvedTheme === 'light' ? 'light' : 'dark';
  if (switchInput) {
    switchInput.checked = resolvedTheme === 'light';
  }
  writeStoredTheme(resolvedTheme);
  return resolvedTheme;
}

let switchInput = null;
syncThemeState(initialTheme);

const CENTER = [71.43029781319242, 51.128310151593574];
const ZOOM   = 13;
const ASTANA = { lat: 51.128, lng: 71.430 };

const MAP_PAINT = {
  dark:  { stroke: 'rgba(12, 16, 24, 0.95)' },
  light: { stroke: 'rgba(252, 252, 248, 0.96)' },
};

function activeTheme() {
  return document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
}
function mapPaint() {
  return MAP_PAINT[activeTheme()] || MAP_PAINT.dark;
}

// ═════════════════════════════════════════════
//  ДАННЫЕ ЗДАНИЙ (baseLux — максимальная яркость при идеальных условиях)
// ═════════════════════════════════════════════

let buildings = [];

async function loadBuildings() {
  const resp = await fetch('./buildings.json', { cache: 'no-store' });
  if (!resp.ok) {
    throw new Error(`Failed to load buildings.json: HTTP ${resp.status}`);
  }

  const data = await resp.json();
  if (!Array.isArray(data)) {
    throw new Error('buildings.json must contain an array');
  }

  buildings = data;
  return buildings;
}


// ═════════════════════════════════════════════
//  ПОГОДА — Open-Meteo API
// ═════════════════════════════════════════════

const weatherState = {
  cloudCover:   0,    // 0-100 %
  isDay:        1,    // 1 = день, 0 = ночь
  weatherCode:  0,    // WMO weather code
  temperature:  null, // °C
  visibility:   null, // метры
  humidity:     null, // %
  loaded:       false,
  error:        false,
  lastUpdate:   null,
};

// WMO weather codes → описание + иконка
const WMO_CODES = {
  0:  { text:'Ясно',                icon:'☀️' },
  1:  { text:'Малооблачно',         icon:'🌤️' },
  2:  { text:'Переменная облачность',icon:'⛅' },
  3:  { text:'Пасмурно',            icon:'☁️' },
  45: { text:'Туман',               icon:'🌫️' },
  48: { text:'Изморозь',            icon:'🌫️' },
  51: { text:'Морось слабая',       icon:'🌦️' },
  53: { text:'Морось',              icon:'🌦️' },
  55: { text:'Морось сильная',      icon:'🌧️' },
  56: { text:'Ледяная морось',      icon:'🌧️' },
  57: { text:'Ледяная морось',      icon:'🌧️' },
  61: { text:'Дождь слабый',        icon:'🌧️' },
  63: { text:'Дождь',               icon:'🌧️' },
  65: { text:'Ливень',              icon:'🌧️' },
  66: { text:'Ледяной дождь',       icon:'🌧️' },
  67: { text:'Ледяной ливень',      icon:'🌧️' },
  71: { text:'Снег слабый',         icon:'🌨️' },
  73: { text:'Снег',                icon:'🌨️' },
  75: { text:'Снегопад',            icon:'🌨️' },
  77: { text:'Снежная крупа',       icon:'🌨️' },
  80: { text:'Ливневый дождь',      icon:'🌦️' },
  81: { text:'Ливень',              icon:'🌧️' },
  82: { text:'Сильный ливень',      icon:'🌧️' },
  85: { text:'Снегопад',            icon:'🌨️' },
  86: { text:'Сильный снегопад',    icon:'🌨️' },
  95: { text:'Гроза',               icon:'⛈️' },
  96: { text:'Гроза с градом',      icon:'⛈️' },
  99: { text:'Гроза с сильным градом',icon:'⛈️' },
};

function getWMO(code) {
  return WMO_CODES[code] || { text:'Неизвестно', icon:'❓' };
}

async function fetchWeather() {
  const url = 'https://api.open-meteo.com/v1/forecast?' + new URLSearchParams({
    latitude:  ASTANA.lat,
    longitude: ASTANA.lng,
    current:   'temperature_2m,relative_humidity_2m,weather_code,cloud_cover,is_day',
    hourly:    'cloud_cover,weather_code,visibility,is_day',
    timezone:  'Asia/Almaty',
    forecast_days: 1,
  });

  try {
    const resp = await fetch(url);
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const data = await resp.json();
    if (data.error) throw new Error(data.reason || 'API error');

    const c = data.current;
    weatherState.cloudCover   = c.cloud_cover ?? 0;
    weatherState.isDay        = c.is_day ?? 1;
    weatherState.weatherCode  = c.weather_code ?? 0;
    weatherState.temperature  = c.temperature_2m;
    weatherState.humidity     = c.relative_humidity_2m;
    weatherState.loaded       = true;
    weatherState.error        = false;
    weatherState.lastUpdate   = new Date();

    // Получим видимость из ближайшего часа
    if (data.hourly && data.hourly.visibility) {
      // API timestamps are expressed in the requested timezone. Compare them
      // with the timestamp returned by that same response so a visitor in a
      // different timezone still gets the correct hourly visibility value.
      const now = c.time ? new Date(c.time) : new Date();
      const times = data.hourly.time.map(t => new Date(t));
      let closest = 0;
      let minDiff = Infinity;
      times.forEach((t, i) => {
        const diff = Math.abs(t - now);
        if (diff < minDiff) { minDiff = diff; closest = i; }
      });
      weatherState.visibility = data.hourly.visibility[closest];
    }

    console.log('[Weather] Loaded:', weatherState);
  } catch (err) {
    console.warn('[Weather] Fetch failed:', err);
    weatherState.error = true;
    weatherState.loaded = true;
  }

  renderWeatherStrip();
  recalcDanger();
  renderMarkers();
  updateLegendNote();
}


// ═════════════════════════════════════════════
//  РАСЧЁТ ПОЛОЖЕНИЯ СОЛНЦА (упрощённый)
// ═════════════════════════════════════════════

function getSunPosition(date, lat, lng) {
  const rad = Math.PI / 180;
  const dayOfYear = Math.floor((date - new Date(date.getFullYear(), 0, 0)) / 86400000);
  const declination = 23.45 * Math.sin(rad * (360 / 365) * (dayOfYear - 81));

  const hourUTC = date.getUTCHours() + date.getUTCMinutes() / 60;
  const solarNoon = 12 - lng / 15;
  const hourAngle = (hourUTC - solarNoon) * 15;

  const sinAlt = Math.sin(lat * rad) * Math.sin(declination * rad) +
                 Math.cos(lat * rad) * Math.cos(declination * rad) * Math.cos(hourAngle * rad);
  const altitude = Math.asin(sinAlt) / rad;

  const cosAz = (Math.sin(declination * rad) - Math.sin(lat * rad) * sinAlt) /
                (Math.cos(lat * rad) * Math.cos(Math.asin(sinAlt)));
  let azimuth = Math.acos(Math.max(-1, Math.min(1, cosAz))) / rad;
  if (hourAngle > 0) azimuth = 360 - azimuth;

  return { altitude, azimuth };
}


// ═════════════════════════════════════════════
//  КОЭФФИЦИЕНТ ОПАСНОСТИ: время + погода + ориентация
// ═════════════════════════════════════════════

function computeTimeSunMultiplier(building) {
  const now = new Date();
  const sun = getSunPosition(now, ASTANA.lat, ASTANA.lng);

  // Ночью — нет бликов
  if (sun.altitude <= 0) return 0;

  // Наиболее опасны низкие углы солнца (< 30°) — слепят водителей на уровне глаз
  let altMul;
  if (sun.altitude < 5) altMul = 0.7;        // Солнце слишком низко, блик в строну
  else if (sun.altitude < 15) altMul = 1.0;   // Самый опасный угол
  else if (sun.altitude < 30) altMul = 0.85;  // Всё ещё опасно
  else if (sun.altitude < 50) altMul = 0.5;   // Умеренно
  else altMul = 0.25;                          // Солнце высоко — блик уходит вниз

  // Ориентация фасада vs азимут солнца
  if (building.orientation != null && building.orientation !== 0) {
    // Отражение максимально когда солнце светит прямо на фасад
    // Угол отклонения
    let angleDiff = Math.abs(sun.azimuth - building.orientation);
    if (angleDiff > 180) angleDiff = 360 - angleDiff;

    // Окно отражения ±60° от нормали фасада
    let orientMul;
    if (angleDiff < 30)       orientMul = 1.0;
    else if (angleDiff < 60)  orientMul = 0.6;
    else if (angleDiff < 90)  orientMul = 0.3;
    else                      orientMul = 0.1;

    altMul *= orientMul;
  }

  return altMul;
}

function computeEffectiveLux(building) {
  const timeSunMul = computeTimeSunMultiplier(building);
  return Math.round(building.baseLux * timeSunMul);
}

function levelOf(lux) {
  if (lux > 50000) return 'danger';
  if (lux >= 10000) return 'warning';
  return 'safe';
}
function levelLabel(level) {
  return { danger: 'Опасно', warning: 'Внимание', safe: 'Безопасно' }[level];
}

function recalcDanger() {
  buildings.forEach(b => {
    b.lux   = computeEffectiveLux(b);
    b.level = levelOf(b.lux);
  });
  updateStats();
}

// Пересчёт каждую минуту
setInterval(() => {
  recalcDanger();
  if (map) {
    renderMarkers();
  }
  updateLegendNote();
}, 60000);

// Обновление погоды каждые 5 минут
setInterval(() => {
  if (document.readyState === 'complete') {
    fetchWeather();
  }
}, 300000);


// ═════════════════════════════════════════════
//  UI — ПОГОДНАЯ ПОЛОСА
// ═════════════════════════════════════════════

function renderWeatherStrip() {
  const strip = document.getElementById('weatherStrip');
  if (!strip) return;

  if (weatherState.error) {
    strip.innerHTML = `
      <div class="weather-strip-error">
        <span>⚠️</span>
        <span>Погода недоступна</span>
      </div>`;
    return;
  }

  if (!weatherState.loaded) return;

  const wmo = getWMO(weatherState.weatherCode);
  const temp = weatherState.temperature != null ? `${Math.round(weatherState.temperature)}°C` : '—';
  const cloud = `${weatherState.cloudCover}%`;
  const sun = getSunPosition(new Date(), ASTANA.lat, ASTANA.lng);
  const sunAlt = sun.altitude > 0 ? `${sun.altitude.toFixed(1)}°` : 'за горизонтом';

  strip.innerHTML = `
    <div class="weather-strip-content">
      <div class="ws-item ws-condition">
        <span class="ws-icon">${wmo.icon}</span>
        <span class="ws-value">${wmo.text}</span>
      </div>
      <div class="ws-item">
        <span class="ws-label">Темп.</span>
        <span class="ws-value">${temp}</span>
      </div>
      <div class="ws-item">
        <span class="ws-label">Облачность</span>
        <span class="ws-value">${cloud}</span>
      </div>
      <div class="ws-item">
        <span class="ws-label">Солнце</span>
        <span class="ws-value">${sunAlt}</span>
      </div>
    </div>`;
}


// ═════════════════════════════════════════════
//  UI — СТАТИСТИКА
// ═════════════════════════════════════════════

function updateStats() {
  const danger  = buildings.filter(b => b.level === 'danger').length;
  const warning = buildings.filter(b => b.level === 'warning').length;
  const safe    = buildings.filter(b => b.level === 'safe').length;

  const statCards = document.querySelectorAll('.stat-card');
  if (statCards.length >= 3) {
    statCards[0].querySelector('.stat-value').textContent = danger;
    statCards[1].querySelector('.stat-value').textContent = warning;
    statCards[2].querySelector('.stat-value').textContent = safe;
  }
}

function updateLegendNote() {
  const el = document.getElementById('legendNote');
  if (!el) return;

  const now = new Date();
  const timeStr = now.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Almaty' });

  if (weatherState.loaded && !weatherState.error) {
    const wmo = getWMO(weatherState.weatherCode);
    el.textContent = `Обновлено ${timeStr} · ${wmo.text}, облачность ${weatherState.cloudCover}%`;
  } else if (weatherState.error) {
    el.textContent = `${timeStr} · Погода недоступна — используются базовые данные`;
  } else {
    el.textContent = `Загрузка данных о погоде…`;
  }
}


// ═════════════════════════════════════════════
//  КАРТА
// ═════════════════════════════════════════════

let map = null;

function initUi() {
  recalcDanger();
  renderWeatherStrip();
  updateLegendNote();
}

function initMap() {
  const mapContainer = document.getElementById('map');
  if (!mapContainer) return;

  mapContainer.classList.remove('map-ready');
  mapContainer.style.opacity = '0';

  map = new maplibregl.Map({
    container: 'map',
    // The document theme is set synchronously in <head>. Read it here instead
    // of using the value captured while this script was loading, so the map
    // and the rest of the UI always start with the same theme.
    style: MAP_STYLE[activeTheme()] || MAP_STYLE.dark,
    center: CENTER,
    zoom: ZOOM,
  });

  map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');

  let keyWarningShown = false;
  map.on('error', (e) => {
    console.error('MapLibre error:', e && e.error);
    if (!keyWarningShown) {
      keyWarningShown = true;
      const warn = document.getElementById('keyWarning');
      if (warn) warn.hidden = false;
    }
  });

  map.on('load', () => {
    currentTheme = activeTheme();
    if (mapContainer) {
      mapContainer.classList.add('map-ready');
      mapContainer.style.opacity = '1';
    }
    renderMarkers();
    fetchWeather(); // загрузить погоду после инициализации карты
  });
}

// ═════════════════════════════════════════════
//  МАРКЕРЫ
// ═════════════════════════════════════════════

let activeMarkers = [];
let currentPopup = null;

function closePopup() {
  if (currentPopup) {
    currentPopup.remove();
    currentPopup = null;
  }
}

function popupHTML(b) {
  const bData = buildings.find(x => x.id === (typeof b.id === 'string' ? parseInt(b.id) : b.id));
  const baseLux = bData ? bData.baseLux : b.lux;
  const effLux  = bData ? bData.lux : b.lux;
  const level   = bData ? bData.level : (b.level || levelOf(b.lux));

  let weatherLine = '';
  if (weatherState.loaded && !weatherState.error) {
    const wmo = getWMO(weatherState.weatherCode);
    weatherLine = `
      <div class="popup-field"><span class="popup-field-label">Погода сейчас</span><span class="popup-field-value">${wmo.icon} ${wmo.text}, облачность ${weatherState.cloudCover}%</span></div>`;
  }

  return `
    <div class="popup-badge popup-badge--${level}">${levelLabel(level)}</div>
    <h3 class="popup-title">${b.name}</h3>
    <p class="popup-address">${b.address}</p>
    <div class="popup-field"><span class="popup-field-label">Макс. освещённость</span><span class="popup-field-value lux">${Number(baseLux).toLocaleString('ru-RU')} лк</span></div>
    <div class="popup-field"><span class="popup-field-label">Сейчас (с учётом погоды)</span><span class="popup-field-value lux">${Number(effLux).toLocaleString('ru-RU')} лк</span></div>
    <div class="popup-field"><span class="popup-field-label">Опасное время</span><span class="popup-field-value">${b.dangerTime}</span></div>
    <div class="popup-field"><span class="popup-field-label">Тип стекла</span><span class="popup-field-value">${b.glass}</span></div>
    ${weatherLine}
  `;
}

function buildGeoJson() {
  return {
    type: 'FeatureCollection',
    features: buildings.map(b => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [b.lng, b.lat],
      },
      properties: {
        id: b.id,
        name: b.name,
        address: b.address,
        lux: b.lux,
        baseLux: b.baseLux,
        period: b.period,
        dangerTime: b.dangerTime,
        glass: b.glass,
        level: b.level,
      },
    })),
  };
}

function renderMarkers() {
  activeMarkers.forEach(m => m.remove());
  activeMarkers = [];
  const paint = mapPaint();

  if (!map.getSource('points')) {
    map.addSource('points', {
      type: 'geojson',
      data: buildGeoJson(),
      cluster: true,
      clusterMaxZoom: 14,
      clusterRadius: 50,
    });

    map.addLayer({
      id: 'clusters',
      type: 'circle',
      source: 'points',
      filter: ['has', 'point_count'],
      paint: {
        'circle-color': [
          'step', ['get', 'point_count'],
          '#22D3A6', 10, '#FFB020', 25, '#FF5A3C',
        ],
        'circle-radius': ['step', ['get', 'point_count'], 18, 10, 22, 25, 28],
        'circle-stroke-width': 1.4,
        'circle-stroke-color': paint.stroke,
      },
    });

    map.addLayer({
      id: 'cluster-count',
      type: 'symbol',
      source: 'points',
      filter: ['has', 'point_count'],
      layout: { 'text-field': ['get', 'point_count'], 'text-size': 11 },
      paint: { 'text-color': '#ffffff' },
    });

    map.addLayer({
      id: 'unclustered-points',
      type: 'circle',
      source: 'points',
      filter: ['!', ['has', 'point_count']],
      paint: {
        'circle-color': [
          'case',
          ['==', ['get', 'level'], 'danger'],  '#FF5A3C',
          ['==', ['get', 'level'], 'warning'], '#FFB020',
          '#22D3A6',
        ],
        'circle-radius': 8,
        'circle-stroke-width': 1.2,
        'circle-stroke-color': paint.stroke,
      },
    });

    map.on('click', 'clusters', (e) => {
      const features = map.queryRenderedFeatures(e.point, { layers: ['clusters'] });
      if (!features.length) return;
      const clusterId = features[0].properties.cluster_id;
      const source = map.getSource('points');
      source.getClusterExpansionZoom(clusterId, (error, zoom) => {
        if (error || typeof zoom !== 'number') return;
        map.easeTo({ center: features[0].geometry.coordinates, zoom });
      });
    });

    map.on('click', 'unclustered-points', (e) => {
      const feature = e.features && e.features[0];
      if (!feature) return;
      closePopup();
      currentPopup = new maplibregl.Popup({ offset: 16, closeButton: true })
        .setLngLat(feature.geometry.coordinates)
        .setHTML(popupHTML(feature.properties))
        .addTo(map);
      currentPopup.on('close', () => { currentPopup = null; });
    });

    map.on('mouseenter', 'clusters',          () => { map.getCanvas().style.cursor = 'pointer'; });
    map.on('mouseleave', 'clusters',          () => { map.getCanvas().style.cursor = ''; });
    map.on('mouseenter', 'unclustered-points', () => { map.getCanvas().style.cursor = 'pointer'; });
    map.on('mouseleave', 'unclustered-points', () => { map.getCanvas().style.cursor = ''; });
  } else {
    map.getSource('points').setData(buildGeoJson());
  }
}


// ═════════════════════════════════════════════
//  ПЕРЕКЛЮЧАТЕЛЬ ТЕМЫ
// ═════════════════════════════════════════════

const themeToggle  = document.getElementById('themeToggle');
switchInput = themeToggle ? themeToggle.querySelector('.switch__input') : null;
const mapWrap      = document.querySelector('.map-wrap');
let currentTheme   = null;
let themeChangeId  = 0;
let themeFadeTimer = 0;
let themeLoadTimer = 0;

function beginMapThemeFade() {
  if (!mapWrap) return;
  window.clearTimeout(themeFadeTimer);
  mapWrap.classList.remove('map-theme-settled');
  mapWrap.classList.add('map-theme-swapping');
}

function endMapThemeFade() {
  if (!mapWrap) return;
  mapWrap.classList.add('map-theme-settled');
  mapWrap.classList.remove('map-theme-swapping');
  window.clearTimeout(themeFadeTimer);
  themeFadeTimer = window.setTimeout(() => {
    mapWrap.classList.remove('map-theme-settled');
  }, 280);
}

function applyTheme(theme) {
  const resolvedTheme = syncThemeState(theme);
  const isLight = resolvedTheme === 'light';
  if (map && (currentTheme === null || resolvedTheme !== currentTheme)) {
    const center  = map.getCenter();
    const zoom    = map.getZoom();
    const bearing = map.getBearing();
    const pitch   = map.getPitch();
    const changeId = ++themeChangeId;
    currentTheme = resolvedTheme;
    beginMapThemeFade();
    window.clearTimeout(themeLoadTimer);
    themeLoadTimer = window.setTimeout(() => {
      if (changeId === themeChangeId) endMapThemeFade();
    }, 1200);
    window.requestAnimationFrame(() => {
      map.setStyle(MAP_STYLE[resolvedTheme] || MAP_STYLE.dark, { diff: false });
    });
    map.once('style.load', () => {
      if (changeId !== themeChangeId) return;
      window.clearTimeout(themeLoadTimer);
      map.jumpTo({ center, zoom, bearing, pitch });
      renderMarkers();
      window.requestAnimationFrame(endMapThemeFade);
    });
  }
}

switchInput.addEventListener('change', () => {
  const nextTheme = switchInput.checked ? 'light' : 'dark';
  applyTheme(nextTheme);
});

window.addEventListener('pageshow', () => {
  const restoredTheme = readStoredTheme();
  if (restoredTheme !== currentTheme) {
    applyTheme(restoredTheme);
  }
});

applyTheme(initialTheme);


// ═════════════════════════════════════════════
//  ИНИЦИАЛИЗАЦИЯ
// ═════════════════════════════════════════════

async function bootstrap() {
  try {
    await loadBuildings();
  } catch (err) {
    console.error('[Buildings] Could not load buildings.json:', err);
    buildings = [];
  }

  initUi();
  initMap();
}

if (document.readyState === 'complete') {
  bootstrap();
} else {
  window.addEventListener('load', bootstrap, { once: true });
}
