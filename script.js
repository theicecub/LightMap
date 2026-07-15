// ════════════════════════════════════════════════════════════════════════════
//  LightMap — Световые блики Астаны / Astana facade glare
//  Опасность точек зависит от времени суток + погоды (Open-Meteo)
// ════════════════════════════════════════════════════════════════════════════

const MAPTILER_KEY = 'JBWS7gL5h6Ob9ya2vfNO';
const MAP_STYLE = {
  dark:  `https://api.maptiler.com/maps/streets-v4-dark/style.json?key=${MAPTILER_KEY}`,
  light: `https://api.maptiler.com/maps/streets-v4/style.json?key=${MAPTILER_KEY}`,
};

// ════════════════════════════════════════════════════════════════════════════
//  i18n — ЛОКАЛИЗАЦИЯ
// ════════════════════════════════════════════════════════════════════════════

const I18N = {
  ru: {
    // Meta
    metaDescription: 'Интерактивная карта опасных световых бликов от фасадов зданий Астаны для водителей',
    // Header
    subtitle: 'Карта опасных световых зон от фасадов зданий для водителей',
    darkMode: 'Dark Mode',
    // Weather strip
    loadingWeather: 'Загрузка погоды…',
    weatherUnavailable: 'Погода недоступна',
    temp: 'Темп.',
    cloudCover: 'Облачность',
    sun: 'Солнце',
    glareFactor: 'Фактор бликов',
    belowHorizon: 'за горизонтом',
    // Legend
    dangerLevel: 'Уровень опасности',
    dangerous: 'Опасно',
    caution: 'Внимание',
    safe: 'Безопасно',
    levelDepends: 'Уровень зависит от времени и погоды',
    // Legend note
    legendUpdated: (time, condition, cloud, glare) =>
      `Обновлено ${time} · ${condition}, облачность ${cloud}% · фактор бликов ${glare}%`,
    legendWeatherUnavailable: (time) =>
      `${time} · Погода недоступна — используются базовые данные`,
    legendLoading: 'Загрузка данных о погоде…',
    // Popup
    maxIlluminance: 'Макс. освещённость',
    currentWeatherAdjusted: 'Сейчас (с учётом погоды)',
    dangerWindow: 'Опасное время',
    glassType: 'Тип стекла',
    currentWeather: 'Погода сейчас',
    weatherGlareFactor: 'Погодный фактор бликов',
    luxUnit: 'лк',
    // WMO weather codes
    wmo: {
      0:  'Ясно',
      1:  'Малооблачно',
      2:  'Переменная облачность',
      3:  'Пасмурно',
      45: 'Туман',
      48: 'Изморозь',
      51: 'Морось слабая',
      53: 'Морось',
      55: 'Морось сильная',
      56: 'Ледяная морось',
      57: 'Ледяная морось',
      61: 'Дождь слабый',
      63: 'Дождь',
      65: 'Ливень',
      66: 'Ледяной дождь',
      67: 'Ледяной ливень',
      71: 'Снег слабый',
      73: 'Снег',
      75: 'Снегопад',
      77: 'Снежная крупа',
      80: 'Ливневый дождь',
      81: 'Ливень',
      82: 'Сильный ливень',
      85: 'Снегопад',
      86: 'Сильный снегопад',
      95: 'Гроза',
      96: 'Гроза с градом',
      99: 'Гроза с сильным градом',
    },
    unknown: 'Неизвестно',
    // Locale for number formatting
    locale: 'ru-RU',
    // Timezone for time display
    timeTimezone: 'Asia/Almaty',
  },
  en: {
    // Meta
    metaDescription: 'Interactive map of hazardous facade glare in Astana for drivers',
    // Header
    subtitle: 'Map of hazardous glare zones from building facades for drivers',
    darkMode: 'Dark Mode',
    // Weather strip
    loadingWeather: 'Loading weather…',
    weatherUnavailable: 'Weather unavailable',
    temp: 'Temp.',
    cloudCover: 'Cloud cover',
    sun: 'Sun',
    glareFactor: 'Glare factor',
    belowHorizon: 'below horizon',
    // Legend
    dangerLevel: 'Danger level',
    dangerous: 'Dangerous',
    caution: 'Caution',
    safe: 'Safe',
    levelDepends: 'Level depends on time and weather',
    // Legend note
    legendUpdated: (time, condition, cloud, glare) =>
      `Updated ${time} · ${condition}, cloud cover ${cloud}% · glare factor ${glare}%`,
    legendWeatherUnavailable: (time) =>
      `${time} · Weather unavailable — using baseline data`,
    legendLoading: 'Loading weather data…',
    // Popup
    maxIlluminance: 'Max illuminance',
    currentWeatherAdjusted: 'Current (weather-adjusted)',
    dangerWindow: 'Danger window',
    glassType: 'Glass type',
    currentWeather: 'Current weather',
    weatherGlareFactor: 'Weather glare factor',
    luxUnit: 'lx',
    // WMO weather codes
    wmo: {
      0:  'Clear',
      1:  'Mostly clear',
      2:  'Partly cloudy',
      3:  'Overcast',
      45: 'Fog',
      48: 'Depositing rime fog',
      51: 'Light drizzle',
      53: 'Drizzle',
      55: 'Dense drizzle',
      56: 'Freezing drizzle',
      57: 'Freezing drizzle',
      61: 'Slight rain',
      63: 'Rain',
      65: 'Rain showers',
      66: 'Freezing rain',
      67: 'Heavy freezing rain',
      71: 'Slight snow fall',
      73: 'Snow fall',
      75: 'Heavy snow fall',
      77: 'Snow grains',
      80: 'Rain showers',
      81: 'Rain showers',
      82: 'Violent rain showers',
      85: 'Heavy snow showers',
      86: 'Heavy snow showers',
      95: 'Thunderstorm',
      96: 'Thunderstorm with hail',
      99: 'Thunderstorm with heavy hail',
    },
    unknown: 'Unknown',
    // Locale for number formatting
    locale: 'en-US',
    // Timezone for time display
    timeTimezone: 'Asia/Almaty',
  },
};

let currentLang = 'ru';
try {
  const savedLang = localStorage.getItem('lang');
  if (savedLang === 'ru' || savedLang === 'en') currentLang = savedLang;
} catch (err) {
  console.warn('[Lang] Could not read localStorage:', err);
}

function t(key) {
  const val = I18N[currentLang][key];
  return val !== undefined ? val : key;
}

function writeStoredLang(lang) {
  try {
    localStorage.setItem('lang', lang);
  } catch (err) {
    console.warn('[Lang] Could not save localStorage:', err);
  }
}

function setLang(lang) {
  if (lang !== 'ru' && lang !== 'en') return;
  currentLang = lang;
  writeStoredLang(lang);
  document.documentElement.lang = lang;
  applyLangToStaticText();
  renderWeatherStrip();
  updateLegendNote();
  recalcDanger();
  renderMarkers();
  refreshOpenPopup();
  // Update active flag
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('lang-btn--active', btn.dataset.lang === lang);
  });
}

function applyLangToStaticText() {
  const tr = I18N[currentLang];

  // Meta description
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) metaDesc.setAttribute('content', tr.metaDescription);

  // Subtitle
  const subtitle = document.querySelector('.subtitle');
  if (subtitle) subtitle.textContent = tr.subtitle;

  // Dark mode label
  const srLabel = document.querySelector('.switch__sr');
  if (srLabel) srLabel.textContent = tr.darkMode;

  // Weather strip loading
  const wsLoading = document.querySelector('.weather-strip-loading span:last-child');
  if (wsLoading) wsLoading.textContent = tr.loadingWeather;

  // Legend
  const legendTitle = document.querySelector('.legend h4');
  if (legendTitle) legendTitle.textContent = tr.dangerLevel;

  const legendItems = document.querySelectorAll('.legend-item span');
  if (legendItems.length >= 3) {
    legendItems[0].textContent = tr.dangerous;
    legendItems[1].textContent = tr.caution;
    legendItems[2].textContent = tr.safe;
  }
}

// ════════════════════════════════════════════════════════════════════════════
//  ТЕМА (Dark / Light)
// ════════════════════════════════════════════════════════════════════════════

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

// ════════════════════════════════════════════════════════════════════════════
//  ДАННЫЕ ЗДАНИЙ (baseLux — максимальная яркость при идеальных условиях)
// ════════════════════════════════════════════════════════════════════════════

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


// ════════════════════════════════════════════════════════════════════════════
//  ПОГОДА — Open-Meteo API
// ════════════════════════════════════════════════════════════════════════════

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

// WMO weather codes → иконка (text comes from i18n)
const WMO_CODES = {
  0:  { icon:'☀️' },
  1:  { icon:'🌤️' },
  2:  { icon:'⛅' },
  3:  { icon:'☁️' },
  45: { icon:'🌫️' },
  48: { icon:'🌫️' },
  51: { icon:'🌦️' },
  53: { icon:'🌦️' },
  55: { icon:'🌧️' },
  56: { icon:'🌧️' },
  57: { icon:'🌧️' },
  61: { icon:'🌧️' },
  63: { icon:'🌧️' },
  65: { icon:'🌧️' },
  66: { icon:'🌧️' },
  67: { icon:'🌧️' },
  71: { icon:'🌨️' },
  73: { icon:'🌨️' },
  75: { icon:'🌨️' },
  77: { icon:'🌨️' },
  80: { icon:'🌦️' },
  81: { icon:'🌧️' },
  82: { icon:'🌧️' },
  85: { icon:'🌨️' },
  86: { icon:'🌨️' },
  95: { icon:'⛈️' },
  96: { icon:'⛈️' },
  99: { icon:'⛈️' },
};

function getWMO(code) {
  const entry = WMO_CODES[code] || { icon: '❓' };
  const text = I18N[currentLang].wmo[code] || I18N[currentLang].unknown;
  return { text, icon: entry.icon };
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
  refreshOpenPopup();
}


// ════════════════════════════════════════════════════════════════════════════
//  РАСЧЁТ ПОЛОЖЕНИЯ СОЛНЦА (упрощённый)
// ════════════════════════════════════════════════════════════════════════════

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


// ════════════════════════════════════════════════════════════════════════════
//  КОЭФФИЦИЕНТ ОПАСНОСТИ: время + погода + ориентация
// ════════════════════════════════════════════════════════════════════════════

// НОВОЕ: погодный множитель — раньше weatherState загружался и показывался
// в UI, но никак не влиял на расчёт люксов. Теперь дождь/снег/туман реально
// гасят блик, а облачность плавно его ослабляет.
function computeWeatherMultiplier() {
  if (!weatherState.loaded || weatherState.error) return 1; // нет данных — не искажаем расчёт

  const code = weatherState.weatherCode;

  // Туман/изморозь — сильное рассеивание, солнце едва пробивается
  const fogCodes = new Set([45, 48]);
  if (fogCodes.has(code)) return 0.15;

  // Осадки любой интенсивности и грозы — прямого солнца практически нет
  const precipCodes = new Set([51,53,55,56,57,61,63,65,66,67,71,73,75,77,80,81,82,85,86,95,96,99]);
  if (precipCodes.has(code)) return 0.05;

  // Ясно / переменная облачность — линейное затухание по проценту облачности
  const cloud = weatherState.cloudCover ?? 0;
  return Math.max(0.1, 1 - (cloud / 100) * 0.9);
}

function computeTimeSunMultiplier(building) {
  const now = new Date();
  const sun = getSunPosition(now, ASTANA.lat, ASTANA.lng);

  // Ночью — нет бликов
  if (sun.altitude <= 0) return 0;

  // Наиболее опасны низкие углы солнца (< 30°) — слепят водителей на уровне глаз
  let altMul;
  if (sun.altitude < 5) altMul = 0.7;        // Солнце слишком низко, блик в сторону
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

function computeEffectiveLux(building, weatherMul) {
  const timeSunMul = computeTimeSunMultiplier(building);
  return Math.round(building.baseLux * timeSunMul * weatherMul);
}

function levelOf(lux) {
  if (lux > 50000) return 'danger';
  if (lux >= 10000) return 'warning';
  return 'safe';
}
function levelLabel(level) {
  const tr = I18N[currentLang];
  return { danger: tr.dangerous, warning: tr.caution, safe: tr.safe }[level];
}

function recalcDanger() {
  const weatherMul = computeWeatherMultiplier();
  buildings.forEach(b => {
    b.lux        = computeEffectiveLux(b, weatherMul);
    b.level      = levelOf(b.lux);
    b.weatherMul = weatherMul; // сохраняем, чтобы показать в попапе без повторного пересчёта
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
  refreshOpenPopup();
}, 60000);

// Обновление погоды каждые 5 минут
setInterval(() => {
  if (document.readyState === 'complete') {
    fetchWeather();
  }
}, 300000);


// ════════════════════════════════════════════════════════════════════════════
//  UI — ПОГОДНАЯ ПОЛОСА
// ════════════════════════════════════════════════════════════════════════════

function renderWeatherStrip() {
  const strip = document.getElementById('weatherStrip');
  if (!strip) return;

  const tr = I18N[currentLang];

  if (weatherState.error) {
    strip.innerHTML = `
      <div class="weather-strip-error">
        <span>⚠️</span>
        <span>${tr.weatherUnavailable}</span>
      </div>`;
    return;
  }

  if (!weatherState.loaded) return;

  const wmo = getWMO(weatherState.weatherCode);
  const temp = weatherState.temperature != null ? `${Math.round(weatherState.temperature)}°C` : '—';
  const cloud = `${weatherState.cloudCover}%`;
  const sun = getSunPosition(new Date(), ASTANA.lat, ASTANA.lng);
  const sunAlt = sun.altitude > 0 ? `${sun.altitude.toFixed(1)}°` : tr.belowHorizon;
  const glarePct = Math.round(computeWeatherMultiplier() * 100);

  strip.innerHTML = `
    <div class="weather-strip-content">
      <div class="ws-item ws-condition">
        <span class="ws-icon">${wmo.icon}</span>
        <span class="ws-value">${wmo.text}</span>
      </div>
      <div class="ws-item">
        <span class="ws-label">${tr.temp}</span>
        <span class="ws-value">${temp}</span>
      </div>
      <div class="ws-item">
        <span class="ws-label">${tr.cloudCover}</span>
        <span class="ws-value">${cloud}</span>
      </div>
      <div class="ws-item">
        <span class="ws-label">${tr.sun}</span>
        <span class="ws-value">${sunAlt}</span>
      </div>
    </div>`;
}


// ════════════════════════════════════════════════════════════════════════════
//  UI — СТАТИСТИКА
// ════════════════════════════════════════════════════════════════════════════

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

  const tr = I18N[currentLang];
  const now = new Date();
  const timeStr = now.toLocaleTimeString(tr.locale, { hour: '2-digit', minute: '2-digit', timeZone: tr.timeTimezone });

  if (weatherState.loaded && !weatherState.error) {
    const wmo = getWMO(weatherState.weatherCode);
    const glarePct = Math.round(computeWeatherMultiplier() * 100);
    el.textContent = tr.legendUpdated(timeStr, wmo.text, weatherState.cloudCover, glarePct);
  } else if (weatherState.error) {
    el.textContent = tr.legendWeatherUnavailable(timeStr);
  } else {
    el.textContent = tr.legendLoading;
  }
}


// ════════════════════════════════════════════════════════════════════════════
//  КАРТА
// ════════════════════════════════════════════════════════════════════════════

let map = null;

function initUi() {
  // Apply language to static text first
  document.documentElement.lang = currentLang;
  applyLangToStaticText();

  // Language switcher
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('lang-btn--active', btn.dataset.lang === currentLang);
    btn.addEventListener('click', () => setLang(btn.dataset.lang));
  });

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

// ════════════════════════════════════════════════════════════════════════════
//  МАРКЕРЫ
// ════════════════════════════════════════════════════════════════════════════

let activeMarkers = [];
let currentPopup = null;
let currentPopupBuildingId = null;

function closePopup() {
  if (currentPopup) {
    currentPopup.remove();
    currentPopup = null;
  }
  currentPopupBuildingId = null;
}

// Перегенерирует HTML уже открытого попапа (вызывается при смене языка,
// пересчёте опасности и обновлении погоды), иначе попап "застывает" на
// тех данных/языке, что были на момент клика по маркеру.
function refreshOpenPopup() {
  if (!currentPopup || currentPopupBuildingId == null) return;
  const bData = buildings.find(b => b.id === currentPopupBuildingId);
  if (!bData) return;
  currentPopup.setHTML(popupHTML(featureProperties(bData)));
}

function popupHTML(b) {
  const tr = I18N[currentLang];
  const isEn = currentLang === 'en';
  const bData = buildings.find(x => x.id === (typeof b.id === 'string' ? parseInt(b.id) : b.id));
  const baseLux = bData ? bData.baseLux : b.lux;
  const effLux  = bData ? bData.lux : b.lux;
  const level   = bData ? bData.level : (b.level || levelOf(b.lux));

  // Localised building fields: fall back to Russian if English is missing
  const bName    = (isEn && bData && bData.name_en)    ? bData.name_en    : b.name;
  const bAddress = (isEn && bData && bData.address_en) ? bData.address_en : b.address;
  const bGlass   = (isEn && bData && bData.glass_en)   ? bData.glass_en   : b.glass;

  let weatherLine = '';
  if (weatherState.loaded && !weatherState.error) {
    const wmo = getWMO(weatherState.weatherCode);
    const weatherMul = (bData && typeof bData.weatherMul === 'number')
      ? bData.weatherMul
      : computeWeatherMultiplier();
    const weatherMulPct = Math.round(weatherMul * 100);
    weatherLine = `
      <div class="popup-field"><span class="popup-field-label">${tr.currentWeather}</span><span class="popup-field-value">${wmo.icon} ${wmo.text}, ${tr.cloudCover.toLowerCase()} ${weatherState.cloudCover}%</span></div>`;
  }

  return `
    <div class="popup-badge popup-badge--${level}">${levelLabel(level)}</div>
    <h3 class="popup-title">${bName}</h3>
    <p class="popup-address">${bAddress}</p>
    <div class="popup-field"><span class="popup-field-label">${tr.maxIlluminance}</span><span class="popup-field-value lux">${Number(baseLux).toLocaleString(tr.locale)} ${tr.luxUnit}</span></div>
    <div class="popup-field"><span class="popup-field-label">${tr.currentWeatherAdjusted}</span><span class="popup-field-value lux">${Number(effLux).toLocaleString(tr.locale)} ${tr.luxUnit}</span></div>
    <div class="popup-field"><span class="popup-field-label">${tr.dangerWindow}</span><span class="popup-field-value">${b.dangerTime}</span></div>
    <div class="popup-field"><span class="popup-field-label">${tr.glassType}</span><span class="popup-field-value">${bGlass}</span></div>
    ${weatherLine}
  `;
}

function featureProperties(b) {
  return {
    id: b.id,
    name: b.name,
    name_en: b.name_en || b.name,
    address: b.address,
    address_en: b.address_en || b.address,
    glass: b.glass,
    glass_en: b.glass_en || b.glass,
    lux: b.lux,
    baseLux: b.baseLux,
    period: b.period,
    dangerTime: b.dangerTime,
    level: b.level,
  };
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
      properties: featureProperties(b),
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
      currentPopupBuildingId = feature.properties.id;
      currentPopup = new maplibregl.Popup({ offset: 16, closeButton: true })
        .setLngLat(feature.geometry.coordinates)
        .setHTML(popupHTML(feature.properties))
        .addTo(map);
      currentPopup.on('close', () => {
        currentPopup = null;
        currentPopupBuildingId = null;
      });
    });

    map.on('mouseenter', 'clusters',          () => { map.getCanvas().style.cursor = 'pointer'; });
    map.on('mouseleave', 'clusters',          () => { map.getCanvas().style.cursor = ''; });
    map.on('mouseenter', 'unclustered-points', () => { map.getCanvas().style.cursor = 'pointer'; });
    map.on('mouseleave', 'unclustered-points', () => { map.getCanvas().style.cursor = ''; });
  } else {
    map.getSource('points').setData(buildGeoJson());
  }
}


// ════════════════════════════════════════════════════════════════════════════
//  ПЕРЕКЛЮЧАТЕЛЬ ТЕМЫ
// ════════════════════════════════════════════════════════════════════════════

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


// ════════════════════════════════════════════════════════════════════════════
//  ИНИЦИАЛИЗАЦИЯ
// ════════════════════════════════════════════════════════════════════════════

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