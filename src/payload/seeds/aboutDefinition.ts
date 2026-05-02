import { IS_BOLD } from 'lexical';

/** Тексты и карточки — как в историческом About.tsx до переноса в CMS. */

export const ABOUT_HEADING = 'Философия бренда';

function paragraph(children: Record<string, unknown>[]) {
  return {
    type: 'paragraph' as const,
    format: '',
    indent: 0,
    direction: 'ltr',
    version: 1,
    children,
  };
}

function textNode(text: string, format = 0) {
  return {
    type: 'text' as const,
    detail: 0,
    format,
    mode: 'normal' as const,
    style: '',
    text,
    version: 1,
  };
}

/** Lexical-состояние для поля richText «lead». */
export const ABOUT_LEAD_LEXICAL = {
  root: {
    type: 'root' as const,
    format: '',
    indent: 0,
    version: 1,
    direction: 'ltr',
    children: [
      paragraph([
        textNode(
          'Бренд ЯНИНА В строится на признании: каждое украшение — это личная история, эмоция и память. Мы создаём ювелирные украшения, отражающие уникальность каждого клиента.',
        ),
      ]),
      paragraph([
        textNode('Художественный подход и профессиональное мастерство:', IS_BOLD),
        textNode(
          ' соединяем эстетику, символизм и современные тренды, при этом сохраняем свою уникальность.',
        ),
      ]),
      paragraph([textNode('Украшения ЯНИНА В несут глубокий эмоциональный заряд, который резонирует с клиентами.')]),
      paragraph([
        textNode('Всё ручная работа:', IS_BOLD),
        textNode(
          ' точные ювелирные техники, авторский художественный взгляд, внимание к деталям и лимитированные серии.',
        ),
      ]),
      paragraph([
        textNode(
          'С 2016 года мы держим планку высокого качества и гарантии — каждое ювелирное изделие становится частью семейного архива. Стремимся сочетать эстетику и тренды.',
        ),
      ]),
    ],
  },
} as const;

/** Порядок как в статическом блоке FEATURES. */
export const ABOUT_FEATURES_SEED = [
  {
    icon: 'heart' as const,
    title: 'Эмоциональная связь',
    description: 'Каждое украшение — это личная история, эмоция и память',
  },
  {
    icon: 'sparkles' as const,
    title: 'Художественный подход',
    description: 'Соединяем эстетику, символизм и современные тренды',
  },
  {
    icon: 'check' as const,
    title: 'Ручная работа',
    description: 'Точные ювелирные техники, авторский взгляд, внимание к деталям',
  },
  {
    icon: 'sparkle4' as const,
    title: 'Семейный архив',
    description: 'С 2016 года создаём украшения, которые передаются поколениями',
  },
  {
    icon: 'clock' as const,
    title: '9+ Лет опыта',
    description: 'Богатый опыт в создании уникальных ювелирных изделий',
  },
  {
    icon: 'shield' as const,
    title: '100% Гарантия качества',
    description: 'Каждое изделие проходит строгий контроль качества',
  },
] as const;
