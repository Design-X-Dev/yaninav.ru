import type { GlobalConfig } from 'payload';

export const ABOUT_GLOBAL_SLUG = 'about';

const ICON_OPTIONS = [
  { label: 'Сердце', value: 'heart' },
  { label: 'Сияние', value: 'sparkles' },
  { label: 'Галочка в круге', value: 'check' },
  { label: 'Звезда 4-конечная', value: 'sparkle4' },
  { label: 'Часы', value: 'clock' },
  { label: 'Щит с галочкой', value: 'shield' },
] as const;

export const About: GlobalConfig = {
  slug: ABOUT_GLOBAL_SLUG,
  label: 'Главная — Философия бренда',
  access: {
    read: () => true,
    update: ({ req }) => Boolean(req.user),
  },
  admin: {
    group: 'Контент сайта',
  },
  fields: [
    {
      name: 'enabled',
      type: 'checkbox',
      defaultValue: true,
      label: 'Показывать секцию',
    },
    {
      name: 'heading',
      type: 'text',
      required: true,
      defaultValue: 'Философия бренда',
      label: 'Заголовок',
    },
    {
      name: 'lead',
      type: 'richText',
      required: true,
      label: 'Текстовый блок (левая колонка)',
    },
    {
      name: 'features',
      type: 'array',
      minRows: 1,
      maxRows: 6,
      label: 'Карточки (правая колонка)',
      fields: [
        {
          name: 'icon',
          type: 'select',
          required: true,
          label: 'Иконка',
          options: [...ICON_OPTIONS],
        },
        { name: 'title', type: 'text', required: true, label: 'Заголовок' },
        {
          name: 'description',
          type: 'textarea',
          required: true,
          label: 'Описание',
        },
      ],
    },
  ],
};
