import type { CollectionConfig } from 'payload';

import { PAYLOAD_ADMIN_GROUPS } from '../adminSidebarGroups';
import {
  revalidateScriptsAfterChange,
  revalidateScriptsAfterDelete,
} from '../hooks/revalidate';

export const SCRIPTS_COLLECTION_SLUG = 'scripts';

export const SCRIPT_LOCATIONS = [
  { label: 'В начало <head> (head_open)', value: 'head_open' },
  { label: 'В конец <head> (head_close)', value: 'head_close' },
  { label: 'В начало <body> (body_open)', value: 'body_open' },
  { label: 'В конец <body> (body_close)', value: 'body_close' },
] as const;

export type ScriptLocation = (typeof SCRIPT_LOCATIONS)[number]['value'];

export const Scripts: CollectionConfig = {
  slug: SCRIPTS_COLLECTION_SLUG,
  labels: { singular: 'Скрипт / вставка', plural: 'Скрипты и вставки' },
  access: {
    // Scripts load via Local API; do not expose code via /api/scripts.
    read: ({ req }) => Boolean(req.user),
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  admin: {
    group: PAYLOAD_ADMIN_GROUPS.system,
    useAsTitle: 'name',
    defaultColumns: ['name', 'key', 'location', 'isActive'],
    description: 'Сторонние скрипты и HTML-вставки (Метрика, GTM, пиксели, виджеты).',
  },
  fields: [
    {
      name: 'key',
      type: 'text',
      unique: true,
      index: true,
      required: true,
      label: 'Системный ключ',
      admin: {
        position: 'sidebar',
        description: 'Стабильный идентификатор для сид-данных, напр. «top-mailru». Не меняйте.',
      },
    },
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'Название (для админки)',
      admin: { description: 'Понятное имя: «Яндекс.Метрика», «GTM», «Пиксель VK».' },
    },
    {
      name: 'location',
      type: 'select',
      required: true,
      defaultValue: 'body_close',
      options: [...SCRIPT_LOCATIONS],
      label: 'Место вставки',
    },
    {
      name: 'code',
      type: 'code',
      required: true,
      label: 'Код (HTML/JS)',
      admin: {
        language: 'html',
        description:
          'Вставьте блок целиком, как из инструкции сервиса. Для head_open/head_close используйте только <script>…</script> (атрибуты src/async/defer сохранятся). Блоки <noscript> и прочий HTML — в body_open / body_close.',
      },
    },
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: false,
      label: 'Активен',
    },
  ],
  hooks: {
    afterChange: [revalidateScriptsAfterChange],
    afterDelete: [revalidateScriptsAfterDelete],
  },
};
