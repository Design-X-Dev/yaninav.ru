import type { GlobalConfig } from 'payload';

import { CONTACT_CHANNEL_DEFAULTS } from '../../lib/contact.defaults';
import { PAYLOAD_ADMIN_GROUPS } from '../adminSidebarGroups';
import { revalidateHomeGlobalsAfterChange } from '../hooks/revalidate';

export const CONTACT_GLOBAL_SLUG = 'contact';

export const Contact: GlobalConfig = {
  slug: CONTACT_GLOBAL_SLUG,
  label: 'Главная — Контакты',
  access: {
    read: () => true,
    update: ({ req }) => Boolean(req.user),
  },
  admin: {
    group: PAYLOAD_ADMIN_GROUPS.homeGlobals,
    description:
      'Тексты секции «Контакты» на главной. Телефон и email также показываются в футере и на странице товара.',
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
      defaultValue: 'Свяжитесь с нами',
      label: 'Заголовок секции',
    },
    {
      name: 'intro',
      type: 'textarea',
      required: true,
      defaultValue:
        'Готовы создать украшение вашей мечты?\n\nСвяжитесь с нами для оформления заказа или консультации',
      label: 'Вводный текст',
      admin: {
        description: 'Два абзаца можно разделить пустой строкой.',
      },
    },
    {
      name: 'contactInfoHeading',
      type: 'text',
      required: true,
      defaultValue: 'Контактная информация',
      label: 'Подзаголовок левой колонки',
    },
    {
      name: 'address',
      type: 'textarea',
      required: true,
      defaultValue: 'г. Екатеринбург, ул. Белинского, 41',
      label: 'Адрес',
    },
    {
      name: 'hours',
      type: 'textarea',
      required: true,
      defaultValue: 'Пн-Пт: 10:00 - 20:00\nСб-Вс: 11:00 - 19:00\nПо предварительной записи',
      label: 'Режим работы',
    },
    {
      type: 'row',
      fields: [
        {
          name: 'phoneDisplay',
          type: 'text',
          required: true,
          defaultValue: CONTACT_CHANNEL_DEFAULTS.phoneDisplay,
          label: 'Телефон (отображение)',
          admin: {
            description: 'На сайте: блок контактов, футер.',
            width: '50%',
          },
        },
        {
          name: 'phoneHref',
          type: 'text',
          required: true,
          defaultValue: CONTACT_CHANNEL_DEFAULTS.phoneHref,
          label: 'Телефон (ссылка tel:)',
          admin: {
            description: 'Например tel:+79991234567',
            width: '50%',
          },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'emailDisplay',
          type: 'text',
          required: true,
          defaultValue: CONTACT_CHANNEL_DEFAULTS.emailDisplay,
          label: 'Email (отображение)',
          admin: {
            width: '50%',
          },
        },
        {
          name: 'emailHref',
          type: 'text',
          required: true,
          defaultValue: CONTACT_CHANNEL_DEFAULTS.emailHref,
          label: 'Email (ссылка mailto:)',
          admin: {
            description: 'Например mailto:hello@example.com',
            width: '50%',
          },
        },
      ],
    },
    {
      name: 'formHeading',
      type: 'text',
      required: true,
      defaultValue: 'Отправить сообщение',
      label: 'Заголовок блока с формой',
    },
    {
      name: 'appointmentButtonText',
      type: 'text',
      required: true,
      defaultValue: 'Записаться на встречу',
      label: 'Текст кнопки записи',
    },
    {
      name: 'appointmentNote',
      type: 'textarea',
      required: true,
      defaultValue: 'Скоро здесь появится календарь и график записи на встречу.',
      label: 'Подпись под кнопкой записи',
    },
  ],
  hooks: {
    afterChange: [revalidateHomeGlobalsAfterChange],
  },
};
