import path from 'path';

import type { CollectionConfig } from 'payload';

import { PAYLOAD_ADMIN_GROUPS } from '../adminSidebarGroups';

export const Media: CollectionConfig = {
  slug: 'media',
  labels: { singular: 'Изображение', plural: 'Изображения' },
  admin: {
    group: PAYLOAD_ADMIN_GROUPS.media,
    useAsTitle: 'filename',
    defaultColumns: ['filename', 'sourceBasename', 'mimeType', 'filesize'],
  },
  access: {
    read: () => true,
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  upload: {
    staticDir: path.resolve(process.cwd(), 'data/media'),
    mimeTypes: ['image/*'],
    imageSizes: [
      { name: 'card', width: 900, height: 900, position: 'centre' },
      { name: 'hero', width: 1600, height: 1600 },
      { name: 'og', width: 1200, height: 630, position: 'centre' },
    ],
  },
  fields: [
    {
      name: 'sourceBasename',
      type: 'text',
      index: true,
      label: 'Исходное имя файла',
      admin: {
        position: 'sidebar',
        description: 'Дедуп при миграции из JSON (например DSC_2367.jpg)',
      },
    },
    { name: 'alt', type: 'text', localized: false, label: 'Подпись / alt' },
  ],
};
