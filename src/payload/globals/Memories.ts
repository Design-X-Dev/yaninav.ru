import type { GlobalConfig } from 'payload';

export const MEMORIES_GLOBAL_SLUG = 'memories';

export const Memories: GlobalConfig = {
  slug: MEMORIES_GLOBAL_SLUG,
  label: 'Главная — Воспоминания',
  access: {
    read: () => true,
    update: ({ req }) => Boolean(req.user),
  },
  admin: {
    group: 'Контент сайта',
  },
  fields: [
    { name: 'heading', type: 'text', required: true, label: 'Заголовок (логотип)' },
    { name: 'subheading', type: 'text', required: true, label: 'Подзаголовок' },
    { name: 'description', type: 'textarea', required: true, label: 'Описание' },
    {
      name: 'slides',
      type: 'array',
      label: 'Слайды',
      minRows: 5,
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true,
          label: 'Картинка',
        },
        { name: 'text', type: 'text', required: true, label: 'Подпись (рукопись)' },
      ],
      admin: {
        description: 'Не менее 5 слайдов — карусель показывает центр и по два с каждой стороны.',
      },
    },
  ],
};
