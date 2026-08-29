const ASTANA_TIME_ZONE = 'Asia/Almaty';

function getAstanaDateParts(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: ASTANA_TIME_ZONE,
    month: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  return {
    month: Number(values.month),
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

function isBuildingGlareActive(building, date = new Date()) {
  if (!building) return false;

  const seasonValue = building.dangerTime_by_season?.[getSeasonKey(date)];
  const windowText = typeof seasonValue === 'string' ? seasonValue.trim() : '';
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
