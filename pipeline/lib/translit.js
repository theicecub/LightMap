// Детерминированная транслитерация RU→EN для адресов и имён (без ИИ).

const MAP = {
  а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'e', ж: 'zh', з: 'z', и: 'i',
  й: 'y', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', пан: null, п: 'p', р: 'r', с: 's', т: 't',
  у: 'u', ф: 'f', х: 'kh', ц: 'ts', ч: 'ch', ш: 'sh', щ: 'shch', ъ: '', ы: 'y',
  ь: '', э: 'e', ю: 'yu', я: 'ya',
};
delete MAP['пан']; // защита от автодополнения не нужна, но ключ лишний

export function translit(text) {
  return (text || '')
    .toLowerCase()
    .split('')
    .map((ch) => (ch in MAP ? MAP[ch] : ch))
    .join('')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/(^|\s|[-(`«"'])(\p{L})/gu, (m) => m.toUpperCase()); // Капитализация Слов
}

// «ул. Сыганак 60/5» → «Syganak St. 60/5»; проспект → Ave.
export function ruAddressToEn(addr) {
  if (!addr) return '';
  const s = addr.trim();
  const isProspect = /^(просп\.?|пр-т|пр-кт)\s+/i.test(s);
  const core = s.replace(/^(ул\.|улица|просп\.?|пр-т|пр-кт|б-р|бульвар|ш\.|шоссе|мкр\.?|микрорайон)\s+/i, '');
  const transliterated = translit(core).replace(/,\s*(?=[\d/])/g, ' '); // «Имя, 4» → «Имя 4»
  const marker = isProspect ? 'Ave.' : 'St.';
  // Вставить St./Ave. перед номером дома (первая цифра/дробь после улицы).
  const withMarker = /\d/.test(transliterated)
    ? transliterated.replace(/\s+([\d/])/, ` ${marker} $1`)
    : `${transliterated} ${marker}`;
  return withMarker;
}
