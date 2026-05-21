import type { GlobalConfig } from 'payload';

import { PAYLOAD_ADMIN_GROUPS } from '../adminSidebarGroups';
import { revalidateHomeGlobalsAfterChange } from '../hooks/revalidate';

export const HOMEPAGE_GLOBAL_SLUG = 'homepage';

export const Homepage: GlobalConfig = {
  slug: HOMEPAGE_GLOBAL_SLUG,
  label: 'Главная — SEO',
  access: {
    read: () => true,
    update: ({ req }) => Boolean(req.user),
  },
  admin: {
    group: PAYLOAD_ADMIN_GROUPS.homeGlobals,
    description: 'Title, description и OG-картинка для маршрута «/». Вкладка SEO добавляется плагином.',
  },
  fields: [],
  hooks: {
    afterChange: [revalidateHomeGlobalsAfterChange],
  },
};
