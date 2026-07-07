  // =====================================================================
  // НАСТРОЙКА: укажите свой API-ключ MapTiler.
  // Получить бесплатный ключ: https://cloud.maptiler.com/account/keys/
  // =====================================================================
  const MAPTILER_KEY = 'JBWS7gL5h6Ob9ya2vfNO';
  const MAP_STYLE = {
    dark: `https://api.maptiler.com/maps/streets-v4-dark/style.json?key=${MAPTILER_KEY}`,
    light: `https://api.maptiler.com/maps/streets-v4/style.json?key=${MAPTILER_KEY}`,
  };
  const savedTheme = localStorage.getItem('theme');
  const initialTheme = savedTheme === 'light' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', initialTheme);

  const CENTER = [71.43029781319242, 51.128310151593574]; // [lng, lat]
  const ZOOM = 13;

  function createBuildings(count = 20) {
    const baseBuildings = [
      {
        id: 1,
        name: 'Abu Dhabi Plaza',
        address: 'ул. Сыганак 60/5',
        lat: 51.12257682152757, lng: 71.42800365052331,
        lux: 62000,
        period: 'both',
        dangerTime: '07:30–09:30 17:30-20:00',
        glass: 'Ламинированное стекло',
      },
      {
        id: 2,
        name: 'Talan Towers',
        address: 'ул. Достык 16',
        lat: 51.125043753584954, lng: 71.43291321421682,
        lux: 71500,
        period: 'evening',
        dangerTime: '17:30–19:00',
        glass: 'Высокоселективное стекло',
      },
      {
        id: 3,
        name: 'Хан Шатыр',
        address: 'просп. Туран, 37',
        lat: 51.13246944940683, lng: 71.40367673211153,
        lux: 34000,
        period: 'morning',
        dangerTime: '07:00–08:00',
        glass: 'Трехслойная мембрана',
      },
      {
        id: 4,
        name: 'Бизнес-центр «Москва»',
        address: 'ул. Достык, 18',
        lat: 51.12460897442751, lng: 71.43427958423301,
        lux: 50500,
        period: 'evening',
        dangerTime: '17:00–18:15',
        glass: 'Панорамное фасадное стекло',
      },
      {
        id: 5,
        name: 'Северное Сияние',
        address: 'ул. Достык, 5',
        lat: 51.12780175944153, lng: 71.42213831345616,
        lux: 62200,
        period: 'morning',
        dangerTime: '08:00-10:00',
        glass: 'Зеркальное архитектурное стекло',
      },
      {
        id: 6,
        name: 'Бизнес-центр «Астаналык»',
        address: 'ул. Динмухамеда Конаева, 33',
        lat: 51.130678053681216, lng: 71.43431213679109,
        lux: 32200,
        period: 'morning',
        dangerTime: '08:00-09:30',
        glass: 'Стеклянный навесной фасад',
      },
      {
        id: 7,
        name: 'Бизнес-центр «Алтын-Орда»',
        address: 'пр. Мангилик Ел, 8/2',
        lat: 51.12753530636626, lng: 71.43936010333385,
        lux: 57400,
        period: 'morning',
        dangerTime: '08:00-10:00',
        glass: 'Панорамное архитеткурное стекло',
      },
      {
        id: 8,
        name: 'Изумрудный квартал (башни A/B)',
        address: 'ул. Динмухамеда Конаева, 8',
        lat: 51.13035215997953, lng: 71.42245808089339,
        lux: 67900,
        period: 'both',
        dangerTime: '08:00-09:30 17:30–19:00',
        glass: 'Зеркальное стекло',
      },
      {
        id: 9,
        name: 'ЖК «Триумф Астаны»',
        address: 'пр. Кабанбай батыра, 11',
        lat: 51.14015931767077, lng: 71.41507162203148,
        lux: 85500,
        period: 'both',
        dangerTime: '08:00-10:00 17:00–19:30',
        glass: 'Зеркальные стеклопакеты',
      },
      {
        id: 10,
        name: 'Байтерек',
        address: 'Булвьар Нуржол, 14',
        lat: 51.128310151593574, lng: 71.43029781319242,
        lux: 25700,
        period: 'both',
        dangerTime: '09:00–11:00 16:00–18:00',
        glass: 'Тонированное стекло',
      },
      {
        id: 11,
        name: 'Нур Алем (сфера EXPO)',
        address: 'территория ЭКСПО, пр. Мәңгілік Ел',
        lat: 51.0891927108529, lng: 71.41589448841293,
        lux: 50000,
        period: 'both',
        dangerTime: '08:30–10:30 17:00–19:00',
        glass: 'Стеклянная сферическая оболочка',
      },
      {
        id: 12,
        name: 'Дворец Независимости',
        address: 'пр. Тәуелсіздік',
        lat: 51.120563632635736, lng: 71.47266671067665,
        lux: 30000,
        period: 'both',
        dangerTime: '09:00–11:00 16:30–18:00',
        glass: 'Стеклянная трапеция с металлической решёткой',
      },
      {
        id: 13,
        name: 'Дворец Мира и Согласия (Пирамида)',
        address: 'пр. Тәуелсіздік',
        lat: 51.12298260469731, lng: 71.46370318362385,
        lux: 28000,
        period: 'both',
        dangerTime: '09:00–11:00 16:00–18:00',
        glass: 'Стеклянные грани пирамиды',
      },
      {
        id: 14,
        name: 'Дворец творчества «Шабыт»',
        address: 'пр. Кабанбай батыра',
        lat: 51.12290729938051, lng: 71.47287192439045,
        lux: 48000,
        period: 'both',
        dangerTime: '08:30–10:00 17:00–18:30',
        glass: 'Стеклянный конусообразный фасад',
      },
      {
        id: 15,
        name: 'Башня «Темір Жолы» (КТЖ)',
        address: 'пр. Мәңгілік Ел',
        lat: 51.13084195522708, lng: 71.42109841891599,
        lux: 52000,
        period: 'both',
        dangerTime: '08:00–09:30 17:00–19:00',
        glass: 'Витражное остекление офисного фасада',
      },
      {
        id: 16,
        name: 'Astana Tower',
        address: 'Есильский р-н',
        lat: 51.15326993834346, lng: 71.42918477879022,
        lux: 32000,
        period: 'both',
        dangerTime: '08:00–09:30 17:30–19:00',
        glass: 'Панорамное стекло, структурный фасад',
      },
      {
        id: 17,
        name: 'Зелёный квартал',
        address: 'Есильский р-н',
        lat: 51.13021814420195, lng: 71.39058525359164,
        lux: 26000,
        period: 'both',
        dangerTime: '08:00–09:30 17:00–18:30',
        glass: 'Стеклянный навесной фасад',
      },
      {
        id: 18,
        name: 'Национальная библиотека (Библиотека Елбасы)',
        address: 'пр. Тәуелсіздік',
        lat: 51.127228110226795, lng: 71.42738260411048,
        lux: 47000,
        period: 'both',
        dangerTime: '09:00–11:00 16:00–18:00',
        glass: 'Сферический стеклянный купол',
      },
      {
        id: 19,
        name: 'Ж/д вокзал «Нұрлы Жол»',
        address: 'Есильский р-н',
        lat: 51.11160220466827, lng: 71.53105585708367,
        lux: 30000,
        period: 'both',
        dangerTime: '08:00–09:30 17:00–19:00',
        glass: 'Стекло и металл, витражный фасад',
      },
    ];

    const generated = Array.from({ length: Math.max(0, count - baseBuildings.length) }, (_, index) => {
      const row = Math.floor(index / 24);
      const col = index % 24;
      const lat = 51.06 + row * 0.0048 + (col % 4) * 0.0007;
      const lng = 71.35 + col * 0.0024 + (row % 3) * 0.0008;
      const lux = 7000 + ((index * 97) % 65000);
      const period = index % 5 === 0 ? 'both' : index % 3 === 0 ? 'evening' : 'morning';
      const dangerTime = period === 'evening' ? '17:30–19:30' : '07:30–09:30';

      return {
        id: baseBuildings.length + index + 1,
        name: `Точка ${baseBuildings.length + index + 1}`,
        address: `ул. Пример ${index + 1}`,
        lat,
        lng,
        lux,
        period,
        dangerTime,
        glass: index % 2 === 0 ? 'Светоотражающее стекло' : 'Многофункциональный фасад',
      };
    });

    return [...baseBuildings, ...generated];
  }

  const buildings = createBuildings(19);

  function levelOf(lux) {
    if (lux > 50000) return 'danger';
    if (lux >= 10000) return 'warning';
    return 'safe';
  }
  function levelLabel(level) {
    return { danger: 'Опасно', warning: 'Внимание', safe: 'Безопасно' }[level];
  }
  buildings.forEach(b => { b.level = levelOf(b.lux); });

  // ===== Карта =====
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
      document.getElementById('keyWarning').hidden = false;
    }
  });

  // ===== Маркеры =====
  let activeMarkers = [];

  function popupHTML(b) {
    return `
      <div class="popup-badge popup-badge--${b.level}">${levelLabel(b.level)}</div>
      <h3 class="popup-title">${b.name}</h3>
      <p class="popup-address">${b.address}</p>
      <div class="popup-field"><span class="popup-field-label">Освещённость</span><span class="popup-field-value lux">${b.lux.toLocaleString('ru-RU')} лк</span></div>
      <div class="popup-field"><span class="popup-field-label">Опасное время</span><span class="popup-field-value">${b.dangerTime}</span></div>
      <div class="popup-field"><span class="popup-field-label">Тип стекла</span><span class="popup-field-value">${b.glass}</span></div>
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
            'step',
            ['get', 'point_count'],
            '#22D3A6',
            10,
            '#FFB020',
            25,
            '#FF5A3C',
          ],
          'circle-radius': ['step', ['get', 'point_count'], 18, 10, 22, 25, 28],
          'circle-stroke-width': 1.4,
          'circle-stroke-color': 'rgba(10, 13, 20, 0.95)',
        },
      });

      map.addLayer({
        id: 'cluster-count',
        type: 'symbol',
        source: 'points',
        filter: ['has', 'point_count'],
        layout: {
          'text-field': ['get', 'point_count'],
          'text-size': 11,
        },
        paint: {
          'text-color': '#ffffff',
        },
      });

      map.addLayer({
        id: 'unclustered-points',
        type: 'circle',
        source: 'points',
        filter: ['!', ['has', 'point_count']],
        paint: {
          'circle-color': [
            'case',
            ['==', ['get', 'level'], 'danger'], '#FF5A3C',
            ['==', ['get', 'level'], 'warning'], '#FFB020',
            '#22D3A6',
          ],
          'circle-radius': 8,
          'circle-stroke-width': 1.2,
          'circle-stroke-color': 'rgba(10, 13, 20, 0.95)',
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

      map.on('mouseenter', 'clusters', () => {
        map.getCanvas().style.cursor = 'pointer';
      });
      map.on('mouseleave', 'clusters', () => {
        map.getCanvas().style.cursor = '';
      });
      map.on('mouseenter', 'unclustered-points', () => {
        map.getCanvas().style.cursor = 'pointer';
      });
      map.on('mouseleave', 'unclustered-points', () => {
        map.getCanvas().style.cursor = '';
      });
    } else {
      map.getSource('points').setData(buildGeoJson(filter));
    }
  }

  // ===== Фильтры =====
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

  // ===== Переключатель темы =====
  const themeToggle = document.getElementById('themeToggle');
  const toggleIcon = themeToggle.querySelector('.toggle-icon');
  const toggleLabel = themeToggle.querySelector('.toggle-label');
  let currentTheme = initialTheme;

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    const isLight = theme === 'light';
    toggleIcon.textContent = isLight ? '🌙' : '☀️';
    toggleLabel.textContent = isLight ? 'Тёмная тема' : 'Светлая тема';
    themeToggle.setAttribute('aria-pressed', String(isLight));
    if (map && theme !== currentTheme) {
      const center = map.getCenter();
      const zoom = map.getZoom();
      const bearing = map.getBearing();
      const pitch = map.getPitch();
      currentTheme = theme;
      map.setStyle(MAP_STYLE[theme] || MAP_STYLE.dark);
      map.once('style.load', () => {
        map.jumpTo({ center, zoom, bearing, pitch });
        renderMarkers(activeFilter);
      });
    }
  }

  themeToggle.addEventListener('click', () => {
    const nextTheme = document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    applyTheme(nextTheme);
  });

  applyTheme(initialTheme);

  // ===== Инициализация =====
  map.on('load', () => renderMarkers(activeFilter));
