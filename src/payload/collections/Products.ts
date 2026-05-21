import type { CollectionConfig } from 'payload';

import { IMAGE_COLLECTION_SLUG } from './Image';
import { PAYLOAD_ADMIN_GROUPS } from '../adminSidebarGroups';
import {
  revalidateProductsAfterChange,
  revalidateProductsAfterDelete,
} from '../hooks/revalidate';

export const Products: CollectionConfig = {
  slug: 'products',
  labels: { singular: 'Товар', plural: 'Товары' },
  admin: {
    group: PAYLOAD_ADMIN_GROUPS.pagesAndCatalog,
    useAsTitle: 'name',
    defaultColumns: ['name', 'category', 'price'],
  },
  access: {
    read: () => true,
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  fields: [
    { name: 'name', type: 'text', required: true, label: 'Название' },
    { name: 'description', type: 'textarea', required: true, label: 'Описание' },
    { name: 'descriptionEnd', type: 'textarea', label: 'Текст после характеристик' },
    {
      name: 'price',
      type: 'number',
      label: 'Цена, ₽',
      admin: {
        description: 'Оставьте пустым — на сайте будет «цена по запросу».',
      },
    },
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'categories',
      required: true,
      label: 'Категория',
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: IMAGE_COLLECTION_SLUG,
      required: true,
      label: 'Главное изображение',
    },
    {
      name: 'image2',
      type: 'upload',
      relationTo: IMAGE_COLLECTION_SLUG,
      label: 'Доп. изображение 2',
    },
    {
      name: 'image3',
      type: 'upload',
      relationTo: IMAGE_COLLECTION_SLUG,
      label: 'Доп. изображение 3',
    },
    {
      name: 'bannerImage',
      type: 'upload',
      relationTo: IMAGE_COLLECTION_SLUG,
      label: 'Баннер',
    },
    {
      name: 'characteristics',
      type: 'array',
      label: 'Характеристики',
      fields: [
        { name: 'key', type: 'text', required: true },
        { name: 'value', type: 'textarea', required: true },
      ],
    },
  ],
  hooks: {
    afterChange: [revalidateProductsAfterChange],
    afterDelete: [revalidateProductsAfterDelete],
  },
};
