import type { GlobalConfig } from 'payload';

import { IMAGE_COLLECTION_SLUG } from '../collections/Image';
import { PAYLOAD_ADMIN_GROUPS } from '../adminSidebarGroups';
import { revalidateHomeGlobalsAfterChange } from '../hooks/revalidate';

export const MEMORIES_GLOBAL_SLUG = 'memories';

export const Memories: GlobalConfig = {
  slug: MEMORIES_GLOBAL_SLUG,
  label: 'Главная — Воспоминания',
  access: {
    // Public site uses Local API. Anonymous REST scrape blocked.
    read: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
  },
  admin: {
    group: PAYLOAD_ADMIN_GROUPS.homeGlobals,
    description:
      'Карусель на главной. Не менее 5 слайдов для показа блока. Галочку «Показывать секцию» можно снять, чтобы скрыть блок без удаления слайдов.',
  },
  fields: [
    {
      name: 'enabled',
      type: 'checkbox',
      defaultValue: true,
      label: 'Показывать секцию на главной',
      admin: {
        description: 'Снимите, чтобы временно скрыть карусель.',
      },
    },
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
          relationTo: IMAGE_COLLECTION_SLUG,
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
  hooks: {
    afterChange: [revalidateHomeGlobalsAfterChange],
  },
};
