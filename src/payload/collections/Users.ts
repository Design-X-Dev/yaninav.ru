import type { CollectionConfig } from 'payload';

import { PAYLOAD_ADMIN_GROUPS } from '../adminSidebarGroups';

export const Users: CollectionConfig = {
  slug: 'users',
  labels: { singular: 'Пользователь', plural: 'Пользователи' },
  admin: { group: PAYLOAD_ADMIN_GROUPS.system, useAsTitle: 'email', defaultColumns: ['email', 'role'] },
  auth: true,
  fields: [
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'admin',
      options: [{ label: 'Admin', value: 'admin' }],
    },
  ],
  access: {
    read: ({ req }) => Boolean(req.user),
    create: () => true,
  },
};
