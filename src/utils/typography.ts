const NBSP = '\u00a0';

/**
 * Заменяет обычный пробел на неразрывный после отдельных слов «с» и «и»
 * (предлог и союз), чтобы не переносились на новую строку одни.
 * Не трогает «с»/«и» внутри слов (слово, семьи и т.д.).
 * Используются только ASCII-пробелы ` ` — уже стоящие NBSP в данных не задеваются.
 */
export function nbspAfterSi(text: string): string {
  if (!text) return text;
  return text
    .replace(/(^|[^\p{L}])([сС]) +/gu, `$1$2${NBSP}`)
    .replace(/(^|[^\p{L}])([иИ]) +/gu, `$1$2${NBSP}`);
}

/** Первая буква строки — заглавная; префикс до неё (пробелы, «», тире) не меняется. */
export function capitalizeFirstLetter(text: string): string {
  if (!text) return text;
  if (text.includes('\n')) {
    return text.split('\n').map((line) => capitalizeFirstLetter(line)).join('\n');
  }
  const m = text.match(/\p{L}/u);
  if (!m || m.index === undefined) return text;
  const i = m.index;
  const ch = text[i];
  return text.slice(0, i) + ch.toLocaleUpperCase('ru-RU') + text.slice(i + 1);
}
