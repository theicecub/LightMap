// ═══════════════════════════════════════════════════════════════
//  LightMap — Световые блики Астаны
//  Опасность точек зависит от времени суток + погоды (Open-Meteo)
// ═══════════════════════════════════════════════════════════════

const MAPTILER_KEY = 'JBWS7gL5h6Ob9ya2vfNO';
const MAP_STYLE = {
  dark:  `https://api.maptiler.com/maps/streets-v4-dark/style.json?key=${MAPTILER_KEY}`,
  light: `https://api.maptiler.com/maps/streets-v4/style.json?key=${MAPTILER_KEY}`,
};
const savedTheme = localStorage.getItem('theme');
const initialTheme = savedTheme === 'light' ? 'light' : 'dark';
document.documentElement.setAttribute('data-theme', initialTheme);

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

function createBuildings(count = 20) {
  const baseBuildings = [
    { id:1,  name:'Abu Dhabi Plaza',                          address:'ул. Сыганак 60/5',                      lat:51.12257682152757,  lng:71.42800365052331, baseLux:62000,  period:'both',    dangerTime:'07:30–09:30 17:30-20:00', glass:'Ламинированное стекло',                              orientation:180 },
    { id:2,  name:'Talan Towers',                             address:'ул. Достык 16',                         lat:51.125043753584954, lng:71.43291321421682, baseLux:71500,  period:'evening', dangerTime:'17:30–19:00',              glass:'Высокоселективное стекло',                           orientation:250 },
    { id:3,  name:'Хан Шатыр',                                address:'просп. Туран, 37',                      lat:51.13246944940683,  lng:71.40367673211153, baseLux:34000,  period:'morning', dangerTime:'07:00–08:00',              glass:'Трехслойная мембрана',                               orientation:120 },
    { id:4,  name:'Бизнес-центр «Москва»',                    address:'ул. Достык, 18',                        lat:51.12460897442751,  lng:71.43427958423301, baseLux:50500,  period:'evening', dangerTime:'17:00–18:15',              glass:'Панорамное фасадное стекло',                         orientation:270 },
    { id:5,  name:'Северное Сияние',                           address:'ул. Достык, 5',                         lat:51.12780175944153,  lng:71.42213831345616, baseLux:62200,  period:'morning', dangerTime:'08:00-10:00',              glass:'Зеркальное архитектурное стекло',                    orientation:90  },
    { id:6,  name:'Бизнес-центр «Астаналык»',                 address:'ул. Динмухамеда Конаева, 33',           lat:51.130678053681216, lng:71.43431213679109, baseLux:32200,  period:'morning', dangerTime:'08:00-09:30',              glass:'Стеклянный навесной фасад',                         orientation:110 },
    { id:7,  name:'Бизнес-центр «Алтын-Орда»',                address:'пр. Мангилик Ел, 8/2',                  lat:51.12753530636626,  lng:71.43936010333385, baseLux:57400,  period:'morning', dangerTime:'08:00-10:00',              glass:'Панорамное архитетктурное стекло',                   orientation:100 },
    { id:8,  name:'Изумрудный квартал (башни A/B)',            address:'ул. Динмухамеда Конаева, 8',            lat:51.13035215997953,  lng:71.42245808089339, baseLux:67900,  period:'both',    dangerTime:'08:00-09:30 17:30–19:00', glass:'Зеркальное стекло',                                  orientation:160 },
    { id:9,  name:'ЖК «Триумф Астаны»',                       address:'пр. Кабанбай батыра, 11',               lat:51.14015931767077,  lng:71.41507162203148, baseLux:85500,  period:'both',    dangerTime:'08:00-10:00 17:00–19:30', glass:'Зеркальные стеклопакеты',                            orientation:145 },
    { id:10, name:'Байтерек',                                  address:'Бульвар Нуржол, 14',                    lat:51.128310151593574, lng:71.43029781319242, baseLux:25700,  period:'both',    dangerTime:'09:00–11:00 16:00–18:00', glass:'Тонированное стекло',                                orientation:0   },
    { id:11, name:'Нур Алем (сфера EXPO)',                     address:'территория ЭКСПО, пр. Мәңгілік Ел',    lat:51.0891927108529,   lng:71.41589448841293, baseLux:50000,  period:'both',    dangerTime:'08:30–10:30 17:00–19:00', glass:'Стеклянная сферическая оболочка',                    orientation:0   },
    { id:12, name:'Дворец Независимости',                      address:'пр. Тәуелсіздік',                       lat:51.120563632635736, lng:71.47266671067665, baseLux:30000,  period:'both',    dangerTime:'09:00–11:00 16:30–18:00', glass:'Стеклянная трапеция с металлической решёткой',       orientation:200 },
    { id:13, name:'Дворец Мира и Согласия (Пирамида)',         address:'пр. Тәуелсіздік',                       lat:51.12298260469731,  lng:71.46370318362385, baseLux:28000,  period:'both',    dangerTime:'09:00–11:00 16:00–18:00', glass:'Стеклянные грани пирамиды',                          orientation:0   },
    { id:14, name:'Дворец творчества «Шабыт»',                address:'пр. Кабанбай батыра',                   lat:51.12290729938051,  lng:71.47287192439045, baseLux:48000,  period:'both',    dangerTime:'08:30–10:00 17:00–18:30', glass:'Стеклянный конусообразный фасад',                    orientation:0   },
    { id:15, name:'Башня «Темір Жолы» (КТЖ)',                 address:'пр. Мәңгілік Ел',                       lat:51.13084195522708,  lng:71.42109841891599, baseLux:52000,  period:'both',    dangerTime:'08:00–09:30 17:00–19:00', glass:'Витражное остекление офисного фасада',               orientation:220 },
    { id:16, name:'Astana Tower',                              address:'Есильский р-н',                         lat:51.15326993834346,  lng:71.42918477879022, baseLux:32000,  period:'both',    dangerTime:'08:00–09:30 17:30–19:00', glass:'Панорамное стекло, структурный фасад',               orientation:180 },
    { id:17, name:'Зелёный квартал',                           address:'Есильский р-н',                         lat:51.13021814420195,  lng:71.39058525359164, baseLux:26000,  period:'both',    dangerTime:'08:00–09:30 17:00–18:30', glass:'Стеклянный навесной фасад',                         orientation:135 },
    { id:18, name:'Национальная библиотека (Библиотека Елбасы)',address:'пр. Тәуелсіздік',                      lat:51.127228110226795, lng:71.42738260411048, baseLux:47000,  period:'both',    dangerTime:'09:00–11:00 16:00–18:00', glass:'Сферический стеклянный купол',                       orientation:0   },
    { id:19, name:'Ж/д вокзал «Нұрлы Жол»',                   address:'Есильский р-н',                         lat:51.11160220466827,  lng:71.53105585708367, baseLux:30000,  period:'both',    dangerTime:'08:00–09:30 17:00–19:00', glass:'Стекло и металл, витражный фасад',                  orientation:170 },
  ];

  const generated = Array.from({ length: Math.max(0, count - baseBuildings.length) }, (_, index) => {
    const row = Math.floor(index / 24);
    const col = index % 24;
    const lat = 51.06 + row * 0.0048 + (col % 4) * 0.0007;
    const lng = 71.35 + col * 0.0024 + (row % 3) * 0.0008;
    const baseLux = 7000 + ((index * 97) % 65000);
    const period = index % 5 === 0 ? 'both' : index % 3 === 0 ? 'evening' : 'morning';
    const dangerTime = period === 'evening' ? '17:30–19:30' : '07:30–09:30';
    return {
      id: baseBuildings.length + index + 1,
      name: `Точка ${baseBuildings.length + index + 1}`,
      address: `ул. Пример ${index + 1}`,
      lat, lng, baseLux, period, dangerTime,
      glass: index % 2 === 0 ? 'Светоотражающее стекло' : 'Многофункциональный фасад',
      orientation: (index * 37) % 360,
    };
  });

  return [...baseBuildings, ...generated];
}

const buildings = createBuildings(19);


// ═════════════════════════════════════════════
//  ПОГОДА — Open-Meteo API
// ═════════════════════════════════════════════

const weatherState = {
  cloudCover:   0,    // 0-100 %
  isDay:        1,    // 1 = день, 0 = ночь
  weatherCode:  0,    // WMO weather code
  temperature:  null, // °C
  visibility:   null, // метры
  windSpeed:    null, // км/ч
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
    current:   'temperature_2m,relative_humidity_2m,weather_code,cloud_cover,is_day,wind_speed_10m',
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
    weatherState.windSpeed    = c.wind_speed_10m;
    weatherState.humidity     = c.relative_humidity_2m;
    weatherState.loaded       = true;
    weatherState.error        = false;
    weatherState.lastUpdate   = new Date();

    // Получим видимость из ближайшего часа
    if (data.hourly && data.hourly.visibility) {
      const now = new Date();
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
  renderMarkers(activeFilter);
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

function computeWeatherMultiplier() {
  // Облачность снижает отражение (чем больше облаков — тем меньше бликов)
  const cloud = weatherState.cloudCover;

  // Базовый множитель от облачности:
  // 0%   облаков → 1.0  (максимум бликов)
  // 50%  облаков → 0.5
  // 100% облаков → 0.10 (почти нет прямого солнечного света)
  let cloudMul = 1.0 - cloud / 100 * 0.9;

  // Коды осадков ещё сильнее снижают блики
  const code = weatherState.weatherCode;
  if (code >= 61 && code <= 67) cloudMul *= 0.3;  // дождь
  else if (code >= 71 && code <= 77) cloudMul *= 0.2; // снег
  else if (code >= 80 && code <= 82) cloudMul *= 0.25; // ливень
  else if (code >= 95) cloudMul *= 0.15; // гроза
  else if (code === 45 || code === 48) cloudMul *= 0.25; // туман
  else if (code >= 51 && code <= 57) cloudMul *= 0.5; // морось

  // Видимость: низкая видимость (< 5 км) снижает блики
  if (weatherState.visibility != null) {
    const vis = weatherState.visibility; // метры
    if (vis < 1000) cloudMul *= 0.2;
    else if (vis < 3000) cloudMul *= 0.5;
    else if (vis < 5000) cloudMul *= 0.7;
  }

  return Math.max(0.05, cloudMul);
}

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
  const timeSunMul  = computeTimeSunMultiplier(building);
  const weatherMul  = weatherState.loaded && !weatherState.error
                        ? computeWeatherMultiplier()
                        : 1.0; // Без погоды — используем базовые значения

  return Math.round(building.baseLux * timeSunMul * weatherMul);
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
  renderMarkers(activeFilter);
  updateLegendNote();
}, 60000);

// Обновление погоды каждые 5 минут
setInterval(fetchWeather, 300000);


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
  const wind = weatherState.windSpeed != null ? `${Math.round(weatherState.windSpeed)} км/ч` : '—';
  const weatherMul = computeWeatherMultiplier();
  const dangerPct = Math.round(weatherMul * 100);
  const sun = getSunPosition(new Date(), ASTANA.lat, ASTANA.lng);
  const sunAlt = sun.altitude > 0 ? `${sun.altitude.toFixed(1)}°` : 'за горизонтом';

  let dangerClass = 'safe';
  if (dangerPct > 70) dangerClass = 'danger';
  else if (dangerPct > 35) dangerClass = 'warning';

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
        <span class="ws-label">Ветер</span>
        <span class="ws-value">${wind}</span>
      </div>
      <div class="ws-item">
        <span class="ws-label">Солнце</span>
        <span class="ws-value">${sunAlt}</span>
      </div>
      <div class="ws-item ws-danger-level">
        <span class="ws-label">Блики</span>
        <span class="ws-badge ws-badge--${dangerClass}">${dangerPct}%</span>
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

recalcDanger(); // первичный расчёт до загрузки карты

const map = new maplibregl.Map({
  container: 'map',
  style: MAP_STYLE[initialTheme],
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

// ═════════════════════════════════════════════
//  МАРКЕРЫ
// ═════════════════════════════════════════════

let activeMarkers = [];

function popupHTML(b) {
  const bData = buildings.find(x => x.id === (typeof b.id === 'string' ? parseInt(b.id) : b.id));
  const baseLux = bData ? bData.baseLux : b.lux;
  const effLux  = bData ? bData.lux : b.lux;
  const level   = bData ? bData.level : (b.level || levelOf(b.lux));

  const weatherMul = computeWeatherMultiplier();
  const pct = weatherState.loaded && !weatherState.error ? Math.round(weatherMul * 100) : null;

  let weatherLine = '';
  if (pct !== null) {
    const wmo = getWMO(weatherState.weatherCode);
    weatherLine = `
      <div class="popup-field"><span class="popup-field-label">Погода сейчас</span><span class="popup-field-value">${wmo.icon} ${wmo.text}, облачность ${weatherState.cloudCover}%</span></div>
      <div class="popup-field"><span class="popup-field-label">Интенсивность бликов</span><span class="popup-field-value">${pct}%</span></div>`;
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

function matchesFilter(b, filter) {
  if (filter === 'all') return true;
  if (filter === 'morning') return b.period === 'morning' || b.period === 'both';
  if (filter === 'evening') return b.period === 'evening' || b.period === 'both';
  return true;
}

function buildGeoJson(filter) {
  const visible = buildings.filter(b => matchesFilter(b, filter));
  return {
    type: 'FeatureCollection',
    features: visible.map(b => ({
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

function renderMarkers(filter) {
  activeMarkers.forEach(m => m.remove());
  activeMarkers = [];
  const paint = mapPaint();

  if (!map.getSource('points')) {
    map.addSource('points', {
      type: 'geojson',
      data: buildGeoJson(filter),
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
      const popup = new maplibregl.Popup({ offset: 16, closeButton: true })
        .setLngLat(feature.geometry.coordinates)
        .setHTML(popupHTML(feature.properties))
        .addTo(map);
      popup.on('close', () => popup.remove());
    });

    map.on('mouseenter', 'clusters',          () => { map.getCanvas().style.cursor = 'pointer'; });
    map.on('mouseleave', 'clusters',          () => { map.getCanvas().style.cursor = ''; });
    map.on('mouseenter', 'unclustered-points', () => { map.getCanvas().style.cursor = 'pointer'; });
    map.on('mouseleave', 'unclustered-points', () => { map.getCanvas().style.cursor = ''; });
  } else {
    map.getSource('points').setData(buildGeoJson(filter));
  }
}


// ═════════════════════════════════════════════
//  ФИЛЬТРЫ
// ═════════════════════════════════════════════

let activeFilter = 'all';
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => {
      b.classList.remove('active');
      b.setAttribute('aria-pressed', 'false');
    });
    btn.classList.add('active');
    btn.setAttribute('aria-pressed', 'true');
    activeFilter = btn.dataset.filter;
    renderMarkers(activeFilter);
  });
});


// ═════════════════════════════════════════════
//  ПЕРЕКЛЮЧАТЕЛЬ ТЕМЫ
// ═════════════════════════════════════════════

const themeToggle  = document.getElementById('themeToggle');
const switchInput  = themeToggle.querySelector('.switch__input');
const mapWrap      = document.querySelector('.map-wrap');
let currentTheme   = initialTheme;
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
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
  const isLight = theme === 'light';
  switchInput.checked = isLight;
  if (map && theme !== currentTheme) {
    const center  = map.getCenter();
    const zoom    = map.getZoom();
    const bearing = map.getBearing();
    const pitch   = map.getPitch();
    const changeId = ++themeChangeId;
    currentTheme = theme;
    beginMapThemeFade();
    window.clearTimeout(themeLoadTimer);
    themeLoadTimer = window.setTimeout(() => {
      if (changeId === themeChangeId) endMapThemeFade();
    }, 1200);
    window.requestAnimationFrame(() => {
      map.setStyle(MAP_STYLE[theme] || MAP_STYLE.dark, { diff: false });
    });
    map.once('style.load', () => {
      if (changeId !== themeChangeId) return;
      window.clearTimeout(themeLoadTimer);
      map.jumpTo({ center, zoom, bearing, pitch });
      renderMarkers(activeFilter);
      window.requestAnimationFrame(endMapThemeFade);
    });
  }
}

switchInput.addEventListener('change', () => {
  const nextTheme = switchInput.checked ? 'light' : 'dark';
  applyTheme(nextTheme);
});

applyTheme(initialTheme);


// ═════════════════════════════════════════════
//  ИНИЦИАЛИЗАЦИЯ
// ═════════════════════════════════════════════

map.on('load', () => {
  renderMarkers(activeFilter);
  fetchWeather(); // загрузить погоду после инициализации карты
});
