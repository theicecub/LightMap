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

const BUILDING_LABELS_KK = {
  'Abu Dhabi Plaza': 'Abu Dhabi Plaza',
  'Talan Towers': 'Talan Towers',
  'Хан Шатыр': 'Хан Шатыр',
  'Бизнес-центр «Москва»': 'Бизнес-орталық «Москва»',
  'Северное Сияние': 'Северное Сияние',
  'Бизнес-центр «Астаналык»': 'Бизнес-орталық «Астаналық»',
  'Бизнес-центр «Алтын-Орда»': 'Бизнес-орталық «Алтын Орда»',
  'Бизнес-центр «Алтын Орда»': 'Бизнес-орталық «Алтын Орда»',
  'Изумрудный квартал (башни A/B)': '«Изумрудный квартал»',
  'Изумрудный квартал': '«Изумрудный квартал»',
  'ЖК «Триумф Астаны»': 'ТК «Триумф Астаны»',
  'Байтерек': 'Бәйтерек',
  'Нур Алем (сфера EXPO)': 'Нұр Әлем',
  'Нур Алем': 'Нұр Әлем',
  'Дворец Независимости': 'Тәуелсіздік сарайы',
  'Дворец Мира и Согласия (Пирамида)': 'Бейбітшілік және келісім сарайы',
  'Дворец Мира и Согласия': 'Бейбітшілік және келісім сарайы',
  'Дворец творчества «Шабыт»': '«Шабыт» шығармашылық сарайы',
  'Башня «Темір Жолы» (КТЖ)': '«Темір Жолы» мұнарасы',
  'Башня «Темір Жолы»': '«Темір Жолы» мұнарасы',
  'Astana Tower': 'Astana Tower',
  'Зелёный квартал': '«Зелёный квартал»',
  'Национальная библиотека': 'Ұлттық кітапхана',
  'Ж/д вокзал «Нұрлы Жол»': '«Нұрлы Жол» теміржол вокзалы',
  'Millennium Park': 'Millennium Park',
  'Министерство финансов Республики Казахстан': 'Қазақстан Республикасы Қаржы министрлігі',
  'Архив Президента Республики Казахстан': 'Қазақстан Республикасы Президентінің архиві',
  'Казмедиа орталығы': '«Қазмедиа» орталығы',
  'КазМунайГаз': 'ҚазМұнайГаз',
  'Дом министерств': 'Министрліктер үйі',
  'БЦ SAAD': 'SAAD бизнес-орталығы',
  'Бизнес-центр «Санкт-Петербург»': 'Бизнес-орталық «Санкт-Петербург»',
  'Beijing Palace Soluxe Hotel Astana': 'Beijing Palace Soluxe Hotel Astana',
  'Highvill Ishim': 'Highvill Ishim',
};

const I18N = {
  ru: {
    // Meta
    metaDescription: 'Интерактивная карта опасных световых бликов от фасадов зданий Астаны для водителей',
    // Header
    subtitle: 'Карта опасных световых зон от фасадов зданий для водителей',
    darkMode: 'Dark Mode',
    driverMode: 'Режим вождения',
    driverLocation: 'Геолокация',
    driverWaitingForGps: 'Ожидание GPS…',
    driverLocationActive: 'Геолокация активна',
    driverLocationUnavailable: 'Геолокация недоступна',
    driverNearestDanger: 'До ближайшей опасности',
    driverNoDanger: 'Опасностей не найдено',
    driverLocationPermission: 'Разрешите доступ к геолокации',
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
    driverMode: 'Driving mode',
    driverLocation: 'Location',
    driverWaitingForGps: 'Waiting for GPS…',
    driverLocationActive: 'Location active',
    driverLocationUnavailable: 'Location unavailable',
    driverNearestDanger: 'Distance to nearest danger',
    driverNoDanger: 'No danger found',
    driverLocationPermission: 'Allow location access',
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
  kk: {
    metaDescription: 'Астанадағы ғимарат қасбеттерінен шығатын қауіпті жарықтың интерактивті картасы',
    subtitle: 'Жүргізушілерге арналған ғимарат қасбеттерінен түсетін қауіпті жарық аймақтарының картасы',
    darkMode: 'Қараңғы режим',
    driverMode: 'Жүргізу режимі',
    driverLocation: 'Геолокация',
    driverWaitingForGps: 'GPS күтілуде…',
    driverLocationActive: 'Геолокация қосулы',
    driverLocationUnavailable: 'Геолокация қолжетімсіз',
    driverNearestDanger: 'Ең жақын қауіпке дейін',
    driverNoDanger: 'Қауіп табылмады',
    driverLocationPermission: 'Геолокацияға рұқсат беріңіз',
    loadingWeather: 'Ауа райы жүктелуде…',
    weatherUnavailable: 'Ауа райы қолжетімсіз',
    temp: 'Темп.',
    cloudCover: 'Бұлттылық',
    sun: 'Күн',
    glareFactor: 'Жарық факторі',
    belowHorizon: 'горизонттан төмен',
    dangerLevel: 'Қауіп деңгейі',
    dangerous: 'Қауіпті',
    caution: 'Ескерту',
    safe: 'Қауіпсіз',
    levelDepends: 'Деңгей уақыт пен ауа райына байланысты',
    legendUpdated: (time, condition, cloud, glare) =>
      `${time} · ${condition}, бұлттылық ${cloud}% · жарық факторі ${glare}%`,
    legendWeatherUnavailable: (time) =>
      `${time} · Ауа райы қолжетімсіз — базалық деректер қолданылуда`,
    legendLoading: 'Ауа райы деректері жүктелуде…',
    maxIlluminance: 'Ең жоғары жарықтану',
    currentWeatherAdjusted: 'Ағымдағы (ауа райын ескере отырып)',
    dangerWindow: 'Қауіпті уақыт аралығы',
    glassType: 'Әйнек түрі',
    currentWeather: 'Қазіргі ауа райы',
    weatherGlareFactor: 'Ауа райының жарық факторі',
    luxUnit: 'лк',
    wmo: {
      0:  'Ашық',
      1:  'Аздап бұлтты',
      2:  'Айнымалы бұлттылық',
      3:  'Бұлтты',
      45: 'Туман',
      48: 'Мұздық туман',
      51: 'Жұқа тұман',
      53: 'Тұман',
      55: 'Қатты тұман',
      56: 'Мұзды тұман',
      57: 'Мұзды тұман',
      61: 'Жұқа жаңбыр',
      63: 'Жаңбыр',
      65: 'Жаңбырлы жаңбыр',
      66: 'Мұзды жаңбыр',
      67: 'Қатты мұзды жаңбыр',
      71: 'Жұқа қар',
      73: 'Қар',
      75: 'Қатты қар',
      77: 'Қар тастары',
      80: 'Жаңбырлы жаңбыр',
      81: 'Жаңбырлы жаңбыр',
      82: 'Қатты жаңбырлы жаңбыр',
      85: 'Қатты қарлы жаңбыр',
      86: 'Қатты қар',
      95: 'Найзағай',
      96: 'Найзағаймен бірге град',
      99: 'Қатты градпен найзағай',
    },
    unknown: 'Белгісіз',
    locale: 'kk-KZ',
    timeTimezone: 'Asia/Almaty',
  },
};

let currentLang = 'ru';
try {
  const savedLang = localStorage.getItem('lang');
  if (savedLang === 'ru' || savedLang === 'en' || savedLang === 'kk') currentLang = savedLang;
} catch (err) {
  console.warn('[Lang] Could not read localStorage:', err);
}

function getLocalizedBuildingLabel(building, fallback = '') {
  if (!building) return fallback;
  if (currentLang === 'en') return building.name_en || building.name || fallback;
  if (currentLang === 'kk') {
    return building.name_kk || BUILDING_LABELS_KK[building.name] || building.name_en || building.name || fallback;
  }
  return building.name || fallback;
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
  if (lang !== 'ru' && lang !== 'en' && lang !== 'kk') return;
  currentLang = lang;
  writeStoredLang(lang);
  document.documentElement.lang = lang;
  applyLangToStaticText();
  renderWeatherStrip();
  updateLegendNote();
  recalcDanger();
  renderMarkers();
  refreshOpenPopup();

  updateLanguageSwitcher(lang);
}

function updateLanguageSwitcher(lang) {
  const labels = {
    ru: '🇷🇺 РУС',
    en: '🇬🇧 ENG',
    kk: '🇰🇿 ҚАЗ',
  };
  const value = document.getElementById('langSwitcherValue');
  if (value) value.textContent = labels[lang] || labels.ru;

  document.querySelectorAll('.lang-menu-option').forEach((option) => {
    option.setAttribute('aria-selected', String(option.dataset.lang === lang));
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

  const driverModeToggle = document.getElementById('driverModeToggle');
  const driverModeLabel = document.getElementById('driverModeLabel');
  if (driverModeLabel) driverModeLabel.textContent = tr.driverMode;
  if (driverModeToggle) {
    driverModeToggle.setAttribute('aria-label', tr.driverMode);
    driverModeToggle.title = tr.driverMode;
  }
  updateDriverModeLabels();

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
const ASTANA_BOUNDS = [
  [71.10, 50.95],
  [71.80, 51.30],
];

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
  weatherCode:  0,    // WMO weather code
  temperature:  null, // °C
  loaded:       false,
  error:        false,
  lastUpdate:   null,
};

// Heroicons outline weather glyphs (text comes from i18n).
const WEATHER_ICONS = {
  sun: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M12 3v1.5m0 15V21m9-9h-1.5M4.5 12H3m15.364 6.364-1.06-1.06M6.697 6.697l-1.06-1.06m12.728 0-1.06 1.06M6.697 17.303l-1.06 1.06M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" /></svg>',
  cloud: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 15a4.5 4.5 0 0 0 4.5 4.5h10.5a4.5 4.5 0 0 0 1.95-8.555 6.002 6.002 0 0 0-11.7 1.555A3.75 3.75 0 0 0 2.25 15Z" /></svg>',
  rain: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 15a4.5 4.5 0 0 0 4.5 4.5h10.5a4.5 4.5 0 0 0 1.95-8.555 6.002 6.002 0 0 0-11.7 1.555A3.75 3.75 0 0 0 2.25 15Zm7.5 3.75-1.5 3m6-3-1.5 3" /></svg>',
  snow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 15a4.5 4.5 0 0 0 4.5 4.5h10.5a4.5 4.5 0 0 0 1.95-8.555 6.002 6.002 0 0 0-11.7 1.555A3.75 3.75 0 0 0 2.25 15Zm6.75 3.75v3m-1.5-1.5h3m3-1.5v3m-1.5-1.5h3" /></svg>',
  bolt: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 15a4.5 4.5 0 0 0-.3-8.99 6.002 6.002 0 0 0-11.7 1.555A3.75 3.75 0 0 0 6.75 15h3l-1.5 6 6-8.25h-3.75l1.5-4.5" /></svg>',
};

const WMO_CODES = {
  0: { icon: WEATHER_ICONS.sun }, 1: { icon: WEATHER_ICONS.sun }, 2: { icon: WEATHER_ICONS.cloud }, 3: { icon: WEATHER_ICONS.cloud },
  45: { icon: WEATHER_ICONS.cloud }, 48: { icon: WEATHER_ICONS.cloud },
  51: { icon: WEATHER_ICONS.rain }, 53: { icon: WEATHER_ICONS.rain }, 55: { icon: WEATHER_ICONS.rain }, 56: { icon: WEATHER_ICONS.rain }, 57: { icon: WEATHER_ICONS.rain },
  61: { icon: WEATHER_ICONS.rain }, 63: { icon: WEATHER_ICONS.rain }, 65: { icon: WEATHER_ICONS.rain }, 66: { icon: WEATHER_ICONS.rain }, 67: { icon: WEATHER_ICONS.rain },
  71: { icon: WEATHER_ICONS.snow }, 73: { icon: WEATHER_ICONS.snow }, 75: { icon: WEATHER_ICONS.snow }, 77: { icon: WEATHER_ICONS.snow }, 80: { icon: WEATHER_ICONS.rain }, 81: { icon: WEATHER_ICONS.rain }, 82: { icon: WEATHER_ICONS.rain }, 85: { icon: WEATHER_ICONS.snow }, 86: { icon: WEATHER_ICONS.snow },
  95: { icon: WEATHER_ICONS.bolt }, 96: { icon: WEATHER_ICONS.bolt }, 99: { icon: WEATHER_ICONS.bolt },
};

function getWMO(code) {
  const entry = WMO_CODES[code] || { icon: WEATHER_ICONS.cloud };
  const text = I18N[currentLang].wmo[code] || I18N[currentLang].unknown;
  return { text, icon: entry.icon };
}

async function fetchWeather() {
  const url = 'https://api.open-meteo.com/v1/forecast?' + new URLSearchParams({
    latitude:  ASTANA.lat,
    longitude: ASTANA.lng,
    current:   'temperature_2m,weather_code,cloud_cover',
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
    weatherState.weatherCode  = c.weather_code ?? 0;
    weatherState.temperature  = c.temperature_2m;
    weatherState.loaded       = true;
    weatherState.error        = false;
    weatherState.lastUpdate   = new Date();


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
//  РАСЧЁТ ПОЛОЖЕНИЯ СОЛНЦА
// ════════════════════════════════════════════════════════════════════════════

function normalizeDegrees(value) {
  return ((value % 360) + 360) % 360;
}

function getSunPosition(date, lat, lng) {
  const rad = Math.PI / 180;
  const deg = 180 / Math.PI;
  const julianDate = date.getTime() / 86400000 + 2440587.5;
  const daysSinceJ2000 = julianDate - 2451545.0;

  // This Julian-date formulation naturally includes leap days and uses the
  // instant represented by Date, so it does not depend on the browser timezone.
  const meanLongitude = normalizeDegrees(280.46 + 0.9856474 * daysSinceJ2000);
  const meanAnomaly = normalizeDegrees(357.528 + 0.9856003 * daysSinceJ2000);
  const eclipticLongitude = meanLongitude +
    1.915 * Math.sin(meanAnomaly * rad) +
    0.02 * Math.sin(2 * meanAnomaly * rad);
  const obliquity = 23.439 - 0.0000004 * daysSinceJ2000;
  const declination = Math.asin(
    Math.sin(obliquity * rad) * Math.sin(eclipticLongitude * rad),
  );
  const rightAscension = normalizeDegrees(Math.atan2(
    Math.cos(obliquity * rad) * Math.sin(eclipticLongitude * rad),
    Math.cos(eclipticLongitude * rad),
  ) * deg);
  const equationOfTimeMinutes = 4 * (((meanLongitude - rightAscension + 540) % 360) - 180);
  const utcMinutes = date.getUTCHours() * 60 + date.getUTCMinutes() + date.getUTCSeconds() / 60;
  const trueSolarMinutes = normalizeDegrees((utcMinutes + 4 * lng + equationOfTimeMinutes) / 4) * 4;
  const hourAngle = (trueSolarMinutes / 4 - 180) * rad;
  const latitude = lat * rad;

  const sinAltitude = Math.sin(latitude) * Math.sin(declination) +
    Math.cos(latitude) * Math.cos(declination) * Math.cos(hourAngle);
  const altitude = Math.asin(Math.max(-1, Math.min(1, sinAltitude))) * deg;

  // atan2 avoids division by cos(altitude), which is ill-conditioned near the
  // horizon. Azimuth is mathematically undefined at zenith, but this remains
  // finite and continuous everywhere relevant to glare calculations.
  const azimuth = normalizeDegrees((Math.atan2(
    Math.sin(hourAngle),
    Math.cos(hourAngle) * Math.sin(latitude) - Math.tan(declination) * Math.cos(latitude),
  ) + Math.PI) * deg);

  return { altitude, azimuth, equationOfTimeMinutes };
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

  // Seasonal windows are the calibrated building data. The physical model
  // refines intensity only while that building can produce glare.
  if (!isBuildingGlareActive(building, now) || sun.altitude <= 0) return 0;

  // Наиболее опасны низкие углы солнца (< 30°) — слепят водителей на уровне глаз
  let altMul;
  if (sun.altitude < 5) altMul = 0.7;        // Солнце слишком низко, блик в сторону
  else if (sun.altitude < 15) altMul = 1.0;   // Самый опасный угол
  else if (sun.altitude < 30) altMul = 0.85;  // Всё ещё опасно
  else if (sun.altitude < 50) altMul = 0.5;   // Умеренно
  else altMul = 0.25;                          // Солнце высоко — блик уходит вниз

  // Ориентация фасада vs азимут солнца
  if (building.orientation != null) {
    // Отражение максимально когда солнце светит прямо на фасад.
    // orientation может быть числом (один фасад) или массивом чисел
    // (несколько граней здания, каждая смотрит в свою сторону) —
    // берём ту грань, что сейчас ближе всего к солнцу.
    const orientations = Array.isArray(building.orientation)
      ? building.orientation
      : [building.orientation];

    let angleDiff = Infinity;
    orientations.forEach(orient => {
      let diff = Math.abs(sun.azimuth - orient);
      if (diff > 180) diff = 360 - diff;
      if (diff < angleDiff) angleDiff = diff;
    });

    // Окно отражения ±90° от нормали фасада. За пределами 90° солнце светит
    // на здание сзади/сбоку — эта грань физически не может отразить его в
    // сторону наблюдателя, поэтому множитель обнуляется, а не просто падает.
    let orientMul;
    if (angleDiff < 30)       orientMul = 1.0;
    else if (angleDiff < 60)  orientMul = 0.6;
    else if (angleDiff < 90)  orientMul = 0.3;
    else                      orientMul = 0;

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
    b.dangerTime = getDangerTimeForBuilding(b, new Date());
    b.weatherMul = weatherMul; // сохраняем, чтобы показать в попапе без повторного пересчёта
  });
  updateStats();
  updateDriverModeStatus();
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

// Драйверский режим показывает только GPS и расстояние до ближайшей
// опасной точки. Расстояние считается локально по координатам зданий.
const driverModeState = {
  active: false,
  watchId: null,
  userPosition: null,
  userMarker: null,
  hasCenteredMap: false,
};

function driverHaversine(lat1, lng1, lat2, lng2) {
  const earthRadius = 6371000;
  const toRadians = value => value * Math.PI / 180;
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLng / 2) ** 2;
  return earthRadius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function updateDriverModeLabels() {
  const tr = I18N[currentLang];
  const locationLabel = document.getElementById('driverLocationLabel');
  const dangerLabel = document.getElementById('driverDangerLabel');
  if (locationLabel) locationLabel.textContent = tr.driverLocation;
  if (dangerLabel) dangerLabel.textContent = tr.driverNearestDanger;
  updateDriverModeStatus();
}

function formatDriverDistance(distance) {
  const tr = I18N[currentLang];
  if (distance < 1000) return `${Math.max(1, Math.round(distance))} ${tr.meters}`;
  return `${(distance / 1000).toLocaleString(tr.locale, { maximumFractionDigits: 1 })} ${tr.km}`;
}

function getNearestDangerDistance(position) {
  if (!position) return null;
  const dangerousBuildings = buildings.filter(building => building.level === 'danger');
  if (!dangerousBuildings.length) return null;
  return Math.min(...dangerousBuildings.map(building =>
    driverHaversine(position.lat, position.lng, building.lat, building.lng)
  ));
}

function updateDriverModeStatus() {
  const tr = I18N[currentLang];
  const locationValue = document.getElementById('driverLocationValue');
  const dangerValue = document.getElementById('driverDangerValue');
  if (!locationValue || !dangerValue) return;

  if (!driverModeState.userPosition) {
    locationValue.textContent = driverModeState.active
      ? tr.driverWaitingForGps
      : tr.driverLocationUnavailable;
    dangerValue.textContent = '—';
    return;
  }

  locationValue.textContent = tr.driverLocationActive;
  const distance = getNearestDangerDistance(driverModeState.userPosition);
  dangerValue.textContent = distance == null ? tr.driverNoDanger : formatDriverDistance(distance);
}

function updateDriverUserMarker() {
  if (!map || !driverModeState.userPosition) return;
  const { lat, lng } = driverModeState.userPosition;
  if (!driverModeState.userMarker) {
    const element = document.createElement('div');
    element.className = 'driver-user-marker';
    element.setAttribute('aria-hidden', 'true');
    driverModeState.userMarker = new maplibregl.Marker({ element })
      .setLngLat([lng, lat])
      .addTo(map);
  } else {
    driverModeState.userMarker.setLngLat([lng, lat]);
  }

  if (driverModeState.active && !driverModeState.hasCenteredMap) {
    driverModeState.hasCenteredMap = true;
    map.easeTo({ center: [lng, lat], duration: 700 });
  }
}

function handleDriverLocation(position) {
  const { latitude, longitude, accuracy } = position.coords;
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return;
  driverModeState.userPosition = {
    lat: latitude,
    lng: longitude,
    accuracy: Number.isFinite(accuracy) ? accuracy : null,
  };
  updateDriverUserMarker();
  updateDriverModeStatus();
}

function handleDriverLocationError(error) {
  const tr = I18N[currentLang];
  const locationValue = document.getElementById('driverLocationValue');
  if (locationValue) {
    locationValue.textContent = error?.code === 1
      ? tr.driverLocationPermission
      : tr.driverLocationUnavailable;
  }
}

function startDriverLocationWatch() {
  if (!navigator.geolocation) {
    handleDriverLocationError({ code: 0 });
    return;
  }
  if (driverModeState.watchId != null) return;
  driverModeState.watchId = navigator.geolocation.watchPosition(
    handleDriverLocation,
    handleDriverLocationError,
    { enableHighAccuracy: true, maximumAge: 5000, timeout: 20000 }
  );
}

function stopDriverLocationWatch() {
  if (driverModeState.watchId != null && navigator.geolocation) {
    navigator.geolocation.clearWatch(driverModeState.watchId);
  }
  driverModeState.watchId = null;
}

function setDriverMapExtrasHidden(hidden) {
  if (!map) return;
  [
    'route-alt',
    'route-safe',
    'route-warning',
    'route-danger',
    'route-hitarea-danger',
    'route-hitarea-warning',
    'route-casing',
    'route-points',
  ].forEach(layerId => {
    if (map.getLayer(layerId)) {
      map.setLayoutProperty(layerId, 'visibility', hidden ? 'none' : 'visible');
    }
  });
}

function setDriverMode(active) {
  const toggle = document.getElementById('driverModeToggle');
  const overlay = document.getElementById('driverModeOverlay');
  driverModeState.active = active;
  driverModeState.hasCenteredMap = false;
  document.body.classList.toggle('driver-mode', active);
  setDriverMapExtrasHidden(active);
  if (toggle) toggle.setAttribute('aria-pressed', String(active));
  if (overlay) overlay.hidden = !active;

  if (active) {
    updateDriverModeStatus();
    startDriverLocationWatch();
    updateDriverUserMarker();
  } else {
    stopDriverLocationWatch();
    if (driverModeState.userMarker) {
      driverModeState.userMarker.remove();
      driverModeState.userMarker = null;
    }
    driverModeState.userPosition = null;
  }
}

function initDriverMode() {
  const toggle = document.getElementById('driverModeToggle');
  if (!toggle || toggle.dataset.ready === 'true') return;
  toggle.dataset.ready = 'true';
  toggle.addEventListener('click', () => setDriverMode(!driverModeState.active));
  updateDriverModeLabels();
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
  const langSwitcher = document.getElementById('langSwitcher');
  const langSwitcherButton = document.getElementById('langSwitcherButton');
  const langMenu = document.getElementById('langMenu');
  const closeLanguageMenu = () => {
    if (!langMenu || !langSwitcherButton) return;
    langMenu.hidden = true;
    langSwitcherButton.setAttribute('aria-expanded', 'false');
  };

  updateLanguageSwitcher(currentLang);
  if (langSwitcherButton && langMenu) {
    langSwitcherButton.addEventListener('click', () => {
      const isOpen = !langMenu.hidden;
      langMenu.hidden = isOpen;
      langSwitcherButton.setAttribute('aria-expanded', String(!isOpen));
    });

    langMenu.querySelectorAll('.lang-menu-option').forEach((option) => {
      option.addEventListener('click', () => {
        setLang(option.dataset.lang);
        closeLanguageMenu();
        langSwitcherButton.focus();
      });
    });

    document.addEventListener('click', (event) => {
      if (langSwitcher && !langSwitcher.contains(event.target)) closeLanguageMenu();
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') closeLanguageMenu();
    });
  }

  recalcDanger();
  initDriverMode();
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
    maxBounds: ASTANA_BOUNDS,
    minZoom: 10,
    maxZoom: 17,
  });

  map.fitBounds(ASTANA_BOUNDS, {
    padding: 20,
    maxZoom: ZOOM,
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
    updateDriverUserMarker();
    fetchWeather(); // загрузить погоду после инициализации карты
  });
}

// ════════════════════════════════════════════════════════════════════════════
//  МАРКЕРЫ
// ════════════════════════════════════════════════════════════════════════════

let currentPopup = null;
let currentPopupBuildingId = null;

function closePopup() {
  if (currentPopup) {
    currentPopup.remove();
    currentPopup = null;
  }
  currentPopupBuildingId = null;
}

function getDangerTimeForBuilding(building, date = new Date()) {
  if (!building) return '—';

  return getBuildingDangerWindow(building, date) || building.dangerTime || 'no glare';
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
  const bData = buildings.find(x => x.id === (typeof b.id === 'string' ? parseInt(b.id, 10) : b.id));
  const baseLux = bData ? bData.baseLux : b.lux;
  const effLux  = bData ? bData.lux : b.lux;
  const level   = bData ? bData.level : (b.level || levelOf(b.lux));
  const dangerTime = getDangerTimeForBuilding(bData || b, new Date());

  const bName = getLocalizedBuildingLabel(bData || b, b.name);
  const bAddress = getLocalizedBuildingField(bData || b, 'address', currentLang, b.address);
  const bGlass = getLocalizedBuildingField(bData || b, 'glass', currentLang, b.glass);

  let weatherLine = '';
  if (weatherState.loaded && !weatherState.error) {
    const wmo = getWMO(weatherState.weatherCode);
    weatherLine = `
      <div class="popup-field"><span class="popup-field-label">${tr.currentWeather}</span><span class="popup-field-value">${wmo.icon} ${wmo.text}, ${tr.cloudCover.toLowerCase()} ${weatherState.cloudCover}%</span></div>`;
  }

  return `
    <div class="popup-badge popup-badge--${level}">${escapeHtml(levelLabel(level))}</div>
    <h3 class="popup-title">${escapeHtml(bName)}</h3>
    <p class="popup-address">${escapeHtml(bAddress)}</p>
    <div class="popup-field"><span class="popup-field-label">${escapeHtml(tr.maxIlluminance)}</span><span class="popup-field-value lux">${Number(baseLux).toLocaleString(tr.locale)} ${escapeHtml(tr.luxUnit)}</span></div>
    <div class="popup-field"><span class="popup-field-label">${escapeHtml(tr.currentWeatherAdjusted)}</span><span class="popup-field-value lux">${Number(effLux).toLocaleString(tr.locale)} ${escapeHtml(tr.luxUnit)}</span></div>
    <div class="popup-field"><span class="popup-field-label">${escapeHtml(tr.dangerWindow)}</span><span class="popup-field-value">${escapeHtml(dangerTime)}</span></div>
    <div class="popup-field"><span class="popup-field-label">${escapeHtml(tr.glassType)}</span><span class="popup-field-value">${escapeHtml(bGlass)}</span></div>
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
    address_kk: b.address_kk || b.address,
    glass: b.glass,
    glass_en: b.glass_en || b.glass,
    glass_kk: b.glass_kk || b.glass,
    lux: b.lux,
    baseLux: b.baseLux,
    period: b.period,
    dangerTime: getDangerTimeForBuilding(b, new Date()),
    level: b.level,
  };
}

function buildGeoJson() {
  // Filter out safe buildings — they disappear when glare is not dangerous
  const visible = buildings.filter(b => b.level === 'danger' || b.level === 'warning');
  return {
    type: 'FeatureCollection',
    features: visible.map(b => ({
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
  const paint = mapPaint();

  if (!map.getSource('points')) {
    // No clustering — every dangerous/warning building is its own point
    map.addSource('points', {
      type: 'geojson',
      data: buildGeoJson(),
    });

    map.addLayer({
      id: 'unclustered-points',
      type: 'circle',
      source: 'points',
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

if (switchInput) {
  switchInput.addEventListener('change', () => {
    const nextTheme = switchInput.checked ? 'light' : 'dark';
    applyTheme(nextTheme);
  });
}

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
