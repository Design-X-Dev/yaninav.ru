import type { GlobalConfig } from 'payload';

import { PAYLOAD_ADMIN_GROUPS } from '../adminSidebarGroups';

export const HOME_CATALOG_GLOBAL_SLUG = 'home-catalog';

export const SELECTION_MODE_OPTIONS = [
  { label: 'Как в каталоге (по ID)', value: 'catalog' },
  { label: 'Самые дорогие', value: 'expensive' },
  { label: 'Самые дешёвые', value: 'cheap' },
  { label: 'Ручной выбор', value: 'manual' },
  { label: 'Случайный порядок', value: 'random' },
] as const;

export type HomeCatalogSelectionMode = (typeof SELECTION_MODE_OPTIONS)[number]['value'];

export const HomeCatalogGlobal: GlobalConfig = {
  slug: HOME_CATALOG_GLOBAL_SLUG,
  label: 'Главная — Наша коллекция',
  access: {
    read: () => true,
    update: ({ req }) => Boolean(req.user),
  },
  admin: {
    group: PAYLOAD_ADMIN_GROUPS.homeGlobals,
    description:
      'Какие товары показывать в блоке «Наша коллекция». В режиме «Случайный» порядок меняется при каждой загрузке страницы.',
  },
  fields: [
    {
      name: 'enabled',
      type: 'checkbox',
      defaultValue: true,
      label: 'Показывать секцию на главной',
    },
    {
      name: 'selectionMode',
      type: 'select',
      required: true,
      defaultValue: 'catalog',
      label: 'Режим набора товаров',
      options: [...SELECTION_MODE_OPTIONS],
      admin: {
        description:
          '«Цена по запросу» (пустая цена) в конце списка для дорогих/дешёвых. Для ручного выбора задайте строки ниже.',
      },
    },
    {
      name: 'manualProducts',
      type: 'array',
      label: 'Товары (ручной порядок)',
      labels: { singular: 'Позиция', plural: 'Товары на главной' },
      admin: {
        condition: (_, siblingData) => siblingData?.selectionMode === 'manual',
        description: 'Порядок строк совпадает с порядком карточек на главной.',
      },
      fields: [
        {
          name: 'product',
          type: 'relationship',
          relationTo: 'products',
          required: true,
          label: 'Товар',
        },
      ],
    },
  ],
};
