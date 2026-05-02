/**
 * Контент глобала «Воспоминания» по умолчанию (до правок из админки).
 * Совпадает с прежней вёрсткой [`MemoriesSection`](../components/MemoriesSection.tsx).
 */
export const MEMORY_DEFAULT_COPY = {
  heading: 'ЯНИНА В',
  subheading: 'Украшения, в которых живут воспоминания',
  description: 'Главная цель и задача — сохранить ценные воспоминания и значимые моменты',
} as const;

/** Файлы в `public/images/`, ключ дедупа в `media.sourceBasename` — префикс в bootstrap. */
export const MEMORY_SLIDE_SOURCES = [
  { file: '001.jpeg', text: 'Сохраняем уникальные моменты' },
  { file: '002.jpeg', text: 'Превращаем эмоции в\u00A0чувства' },
  { file: '003.jpeg', text: 'Для\u00A0тех, кто верит в\u00A0любовь' },
  { file: '004.jpeg', text: 'Истинная ценность ювелирных изделий - в\u00A0эмоциональной связи' },
  { file: '005.jpeg', text: 'Созданы друг для\u00A0друга' },
] as const;
