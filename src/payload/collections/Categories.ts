import type { CollectionConfig } from 'payload';

import { PAYLOAD_ADMIN_GROUPS } from '../adminSidebarGroups';

function slugFromName(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, '-');
}

export const Categories: CollectionConfig = {
  slug: 'categories',
  labels: { singular: 'Категория', plural: 'Категории' },
  admin: { group: PAYLOAD_ADMIN_GROUPS.catalog, useAsTitle: 'name', defaultColumns: ['name', 'slug', 'order'] },
  access: {
    read: () => true,
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  fields: [
    { name: 'name', type: 'text', required: true, label: 'Название' },
    { name: 'slug', type: 'text', required: true, unique: true, index: true, label: 'Slug' },
    {
      name: 'order',
      type: 'number',
      defaultValue: 999,
      label: 'Порядок в навигации',
      admin: { description: 'Чем меньше, тем выше в списке фильтров шапки.' },
    },
  ],
  hooks: {
    beforeValidate: [
      ({ data }) => {
        if (!data) return data;
        const name = typeof data.name === 'string' ? data.name : '';
        if (!data.slug && name) {
          data.slug = slugFromName(name);
        }
        return data;
      },
    ],
  },
};
