const ASTANA_TIME_ZONE = 'Asia/Almaty';

function getAstanaDateParts(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: ASTANA_TIME_ZONE,
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  return {
    month: Number(values.month),
    day: Number(values.day),
    minutes: Number(values.hour) * 60 + Number(values.minute),
  };
}

function getSeasonKey(date = new Date()) {
  const { month } = getAstanaDateParts(date);
  if (month === 12 || month === 1 || month === 2) return 'winter';
  if (month <= 5) return 'spring';
  if (month <= 8) return 'summer';
  return 'autumn';
}

function parseClockTime(value) {
  const match = /^(\d{1,2}):(\d{2})$/.exec(value);
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) return null;
  return hours * 60 + minutes;
}

const DANGER_PERIOD_MONTHS = {
  Jan: 1, Feb: 2, Mar: 3, Apr: 4, May: 5, Jun: 6,
  Jul: 7, Aug: 8, Sep: 9, Oct: 10, Nov: 11, Dec: 12,
};

function matchesDangerPeriod(period, date) {
  const match = /^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{1,2})-(\d{1,2})$/i.exec(period || '');
  if (!match) return false;

  const { month, day } = getAstanaDateParts(date);
  const periodMonth = match[1][0].toUpperCase() + match[1].slice(1).toLowerCase();
  return DANGER_PERIOD_MONTHS[periodMonth] === month &&
    day >= Number(match[2]) && day <= Number(match[3]);
}

function getBuildingDangerWindow(building, date = new Date()) {
  if (!building) return '';

  const seasonMap = building.dangerTime_by_season || {};
  const seasonValue = seasonMap[getSeasonKey(date)];
  if (typeof seasonValue === 'string') return seasonValue.trim();

  if (Array.isArray(seasonValue)) {
    const matchingPeriod = seasonValue.find(entry => matchesDangerPeriod(entry?.period, date));
    return typeof matchingPeriod?.dangerTime === 'string' ? matchingPeriod.dangerTime.trim() : '';
  }

  return '';
}

function isBuildingGlareActive(building, date = new Date()) {
  if (!building) return false;

  const windowText = getBuildingDangerWindow(building, date);
  if (!windowText || /^no glare$/i.test(windowText)) return false;

  const { minutes: now } = getAstanaDateParts(date);
  return windowText.split(/\s+/).some(interval => {
    const [startText, endText] = interval.split('-');
    const start = parseClockTime(startText);
    const end = parseClockTime(endText);
    if (start == null || end == null) return false;
    return start <= end
      ? now >= start && now <= end
      : now >= start || now <= end;
  });
}
