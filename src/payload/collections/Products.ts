import type { CollectionConfig } from 'payload';

export const Products: CollectionConfig = {
  slug: 'products',
  labels: { singular: 'Товар', plural: 'Товары' },
  admin: {
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
      relationTo: 'media',
      required: true,
      label: 'Главное изображение',
    },
    {
      name: 'image2',
      type: 'upload',
      relationTo: 'media',
      label: 'Доп. изображение 2',
    },
    {
      name: 'image3',
      type: 'upload',
      relationTo: 'media',
      label: 'Доп. изображение 3',
    },
    {
      name: 'bannerImage',
      type: 'upload',
      relationTo: 'media',
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
};
