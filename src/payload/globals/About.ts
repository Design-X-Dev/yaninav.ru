import type { GlobalConfig } from 'payload';

import { PAYLOAD_ADMIN_GROUPS } from '../adminSidebarGroups';
import { revalidateHomeGlobalsAfterChange } from '../hooks/revalidate';

export const ABOUT_GLOBAL_SLUG = 'about';

const ICON_OPTIONS = [
  { label: 'Сердце', value: 'heart' },
  { label: 'Сияние', value: 'sparkles' },
  { label: 'Галочка в круге', value: 'check' },
  { label: 'Звезда 4-конечная', value: 'sparkle4' },
  { label: 'Часы', value: 'clock' },
  { label: 'Щит с галочкой', value: 'shield' },
  { label: 'Драгоценный камень', value: 'gem' },
  { label: 'Бриллиант', value: 'diamond' },
  { label: 'Корона', value: 'crown' },
  { label: 'Лист', value: 'leaf' },
  { label: 'Цветок', value: 'flower' },
  { label: 'Перо', value: 'feather' },
  { label: 'Палитра', value: 'palette' },
  { label: 'Перо для эскиза', value: 'pen' },
  { label: 'Рука с сердцем', value: 'handHeart' },
  { label: 'Рукопожатие', value: 'handshake' },
  { label: 'Знак качества', value: 'badgeCheck' },
  { label: 'Замок', value: 'lock' },
  { label: 'Весы', value: 'scale' },
  { label: 'Компас', value: 'compass' },
  { label: 'Взгляд', value: 'eye' },
  { label: 'Звезда', value: 'star' },
  { label: 'Солнце', value: 'sun' },
  { label: 'Луна', value: 'moon' },
  { label: 'Волшебная палочка', value: 'wand' },
  { label: 'Подарок', value: 'gift' },
] as const;

export const About: GlobalConfig = {
  slug: ABOUT_GLOBAL_SLUG,
  label: 'Главная — Философия бренда',
  access: {
    // Public site uses Local API. Anonymous REST scrape blocked.
    read: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
  },
  admin: {
    group: PAYLOAD_ADMIN_GROUPS.homeGlobals,
    description: 'Левая колонка («Философия») и карточки справа. Иконки — из фиксированного набора.',
  },
  fields: [
    {
      name: 'enabled',
      type: 'checkbox',
      defaultValue: true,
      label: 'Показывать секцию на главной',
    },
    {
      name: 'heading',
      type: 'text',
      required: true,
      defaultValue: 'Философия бренда',
      label: 'Заголовок',
    },
    {
      name: 'lead',
      type: 'richText',
      required: true,
      label: 'Текстовый блок (левая колонка)',
    },
    {
      name: 'features',
      type: 'array',
      minRows: 1,
      maxRows: 6,
      label: 'Карточки (правая колонка)',
      fields: [
        {
          name: 'icon',
          type: 'select',
          required: true,
          label: 'Иконка',
          options: [...ICON_OPTIONS],
        },
        { name: 'title', type: 'text', required: true, label: 'Заголовок' },
        {
          name: 'description',
          type: 'textarea',
          required: true,
          label: 'Описание',
        },
      ],
    },
  ],
  hooks: {
    afterChange: [revalidateHomeGlobalsAfterChange],
  },
};
