import path from 'path';

import type { CollectionConfig } from 'payload';

import { PAYLOAD_ADMIN_GROUPS } from '../adminSidebarGroups';

export const VIDEO_COLLECTION_SLUG = 'video';

export const Video: CollectionConfig = {
  slug: VIDEO_COLLECTION_SLUG,
  labels: { singular: 'Видеофайл', plural: 'Видеофайлы' },
  admin: {
    group: PAYLOAD_ADMIN_GROUPS.media,
    useAsTitle: 'filename',
    defaultColumns: ['filename', 'sourceBasename', 'mimeType', 'filesize'],
  },
  access: {
    // Must stay public: Payload uses `read` for /api/video/file/* serving.
    read: () => true,
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  upload: {
    staticDir: path.resolve(process.cwd(), 'data/video'),
    mimeTypes: ['video/mp4', 'video/webm'],
  },
  fields: [
    {
      name: 'sourceBasename',
      type: 'text',
      index: true,
      label: 'Исходное имя файла',
      admin: {
        position: 'sidebar',
        description: 'Дедуп при сидере (например home-hero/jewelry-hero.mp4)',
      },
    },
    { name: 'alt', type: 'text', label: 'Подпись' },
  ],
};
