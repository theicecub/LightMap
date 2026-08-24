// Портированная БЕЗ ИЗМЕНЕНИЙ ЛОГИКА солнечной геометрии из script.js (getSunPosition)
// + генерация статических строк period/dangerTime для новых записей buildings.json.
// КРИТЕРИЙ ОПАСНОСТИ взят из рантайма script.js: отражение значимо, когда солнце
// светит на фасад (|азимут − ориентация| < 60°) и стоит низко-средне (5° < h < 50°).

const RAD = Math.PI / 180;
const ASTANA_TZ_OFFSET_H = 5; // UTC+5, без перехода на летнее время

export function getSunPosition(date, lat, lng) {
  const dayOfYear = Math.floor((date - new Date(date.getFullYear(), 0, 0)) / 86400000);
  const declination = 23.45 * Math.sin(RAD * (360 / 365) * (dayOfYear - 81));

  const hourUTC = date.getUTCHours() + date.getUTCMinutes() / 60;
  const solarNoon = 12 - lng / 15;
  const hourAngle = (hourUTC - solarNoon) * 15;

  const sinAlt = Math.sin(lat * RAD) * Math.sin(declination * RAD) +
    Math.cos(lat * RAD) * Math.cos(declination * RAD) * Math.cos(hourAngle * RAD);
  const altitude = Math.asin(sinAlt) / RAD;

  const cosAz = (Math.sin(declination * RAD) - Math.sin(lat * RAD) * sinAlt) /
    (Math.cos(lat * RAD) * Math.cos(Math.asin(sinAlt)));
  let azimuth = Math.acos(Math.max(-1, Math.min(1, cosAz))) / RAD;
  if (hourAngle > 0) azimuth = 360 - azimuth;

  return { altitude, azimuth };
}

function angleDiff(a, b) {
  let d = Math.abs(a - b);
  if (d > 180) d = 360 - d;
  return d;
}

function fmt(t) { // t — минуты от местной полуночи, округляем к :00/:30
  const m = Math.round(t / 30) * 30;
  return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
}

function median(arr) {
  if (!arr.length) return null;
  const s = [...arr].sort((x, y) => x - y);
  return s[Math.floor(s.length / 2)];
}

// Сканируем год (каждый 5-й день, шаг 10 минут, местное время), находим для каждого
// дня самое широкое утреннее и вечернее окно опасного блика; dangerTime — медианы
// границ по году; period — какие окна существуют в среднем.
// orientation = null/0 → фасад неизвестен: окна по одной высоте солнца (утро+вечер).
export function dangerWindowsForOrientation(orientation, lat, lng) {
  const useOrientation = orientation != null && orientation !== 0;
  const morning = { starts: [], ends: [] };
  const evening = { starts: [], ends: [] };

  for (let day = 1; day <= 365; day += 5) {
    const windows = [];
    let curStart = null, curSlot = null;

    for (let t = 0; t <= 1440; t += 10) {
      const slot = t < 720 ? 'morning' : 'evening';
      const utcH = t / 60 - ASTANA_TZ_OFFSET_H;
      const date = new Date(Date.UTC(2026, 0, day, Math.floor(utcH), (utcH % 1) * 60));
      const { altitude, azimuth } = getSunPosition(date, lat, lng);
      const danger = altitude > 5 && altitude < 50 &&
        (!useOrientation || angleDiff(azimuth, orientation) < 60);

      if (danger) {
        if (curStart === null) { curStart = t; curSlot = slot; }
        else if (curSlot !== slot) { // утреннее окно перетекло в вечернее
          windows.push({ slot: curSlot, start: curStart, end: t });
          curStart = t; curSlot = slot;
        }
      } else if (curStart !== null) {
        windows.push({ slot: curSlot, start: curStart, end: t });
        curStart = null;
      }
    }
    if (curStart !== null) windows.push({ slot: curSlot, start: curStart, end: 1440 });

    for (const slot of ['morning', 'evening']) {
      const inSlot = windows.filter((w) => w.slot === slot);
      if (!inSlot.length) continue;
      const widest = inSlot.reduce((b, w) => (w.end - w.start > b.end - b.start ? w : b));
      (slot === 'morning' ? morning : evening).starts.push(widest.start);
      (slot === 'morning' ? morning : evening).ends.push(widest.end);
    }
  }

  const parts = [];
  if (morning.starts.length) parts.push(`${fmt(median(morning.starts))}–${fmt(median(morning.ends))}`);
  if (evening.starts.length) parts.push(`${fmt(median(evening.starts))}–${fmt(median(evening.ends))}`);

  if (!parts.length) return { period: 'morning', dangerTime: '' };
  const period = parts.length === 2 ? 'both' : (morning.starts.length ? 'morning' : 'evening');
  return { period, dangerTime: parts.join(' ') };
}
