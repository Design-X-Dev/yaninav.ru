import type { CollectionConfig } from 'payload';

import { PAYLOAD_ADMIN_GROUPS } from '../adminSidebarGroups';
import {
  revalidatePagesAfterChange,
  revalidatePagesAfterDelete,
} from '../hooks/revalidate';

export const PAGES_COLLECTION_SLUG = 'pages';

/** Не создавать страницы с этими slug — пересекаются с системными маршрутами Next.js / Payload. */
export const RESERVED_PAGE_SLUGS = new Set([
  'home',
  'admin',
  'api',
  'products',
  'collection',
  'favorites',
  '_next',
]);

export const Pages: CollectionConfig = {
  slug: PAGES_COLLECTION_SLUG,
  labels: { singular: 'Страница', plural: 'Страницы' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'updatedAt'],
    group: PAYLOAD_ADMIN_GROUPS.pagesAndCatalog,
  },
  versions: {
    drafts: true,
  },
  access: {
    // Anonymous REST: published only. Drafts never leave admin. (Keep; do not lock fully.)
    read: ({ req }) =>
      req.user ? true : { _status: { equals: 'published' } },
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      localized: true,
      label: 'Заголовок (H1 на сайте)',
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      localized: false,
      label: 'Slug URL',
      admin: {
        description:
          'Латиница и дефисы, без слэша. Например: delivery, warranty, privacy. Нельзя: products, collection, …',
      },
      validate: (value: unknown) => {
        const s = typeof value === 'string' ? value.trim().toLowerCase() : '';
        if (!s) return 'Укажите slug';
        if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(s)) {
          return 'Только латинские буквы, цифры и дефисы';
        }
        if (RESERVED_PAGE_SLUGS.has(s)) {
          return 'Этот slug зарезервирован системой';
        }
        return true;
      },
    },
    {
      name: 'body',
      type: 'richText',
      required: true,
      localized: true,
      label: 'Текст страницы',
    },
    {
      name: 'showLegalDivider',
      type: 'checkbox',
      defaultValue: false,
      localized: false,
      label: 'Юридический разделитель перед футером',
      admin: {
        description: 'Как на страницах «Гарантии», «Оферта», «Конфиденциальность».',
      },
    },
  ],
  hooks: {
    beforeValidate: [
      ({ data }) => {
        if (!data) return data;
        if (typeof data.slug === 'string') {
          data.slug = data.slug.trim().toLowerCase();
        }
        return data;
      },
    ],
    afterChange: [revalidatePagesAfterChange],
    afterDelete: [revalidatePagesAfterDelete],
  },
};
