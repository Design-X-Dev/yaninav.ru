/** Телефон и почта: источник истины — глобал Payload «Контакты»; эти строки — только запасной сид и SSR при ошибке БД. */
export const CONTACT_CHANNEL_DEFAULTS = {
  phoneDisplay: '+7 (992) 014-71-27',
  phoneHref: 'tel:+79920147127',
  emailDisplay: 'yaninav-jewelrystudio@yandex.ru',
  emailHref: 'mailto:yaninav-jewelrystudio@yandex.ru',
} as const;

/** Ссылка WhatsApp из `tel:` (цифры после безопасной очистки). */
export function phoneHrefToWhatsAppLink(phoneHref: string): string {
  const digits = phoneHref.replace(/^tel:/i, '').replace(/\D/g, '');
  if (!digits) return `https://wa.me/${CONTACT_CHANNEL_DEFAULTS.phoneHref.replace(/\D/g, '')}`;
  return `https://wa.me/${digits}`;
}

/** Дефолты секции «Контакты» на главной (глобал + fallback на фронте). */
export const CONTACT_SECTION_DEFAULTS = {
  heading: 'Свяжитесь с нами',
  intro:
    'Готовы создать украшение вашей мечты?\n\nСвяжитесь с нами для оформления заказа или консультации',
  contactInfoHeading: 'Контактная информация',
  address: 'г. Екатеринбург, ул. Белинского, 41',
  hours: 'Пн-Пт: 10:00 - 20:00\nСб-Вс: 11:00 - 19:00\nПо предварительной записи',
  formHeading: 'Отправить сообщение',
  appointmentButtonText: 'Записаться на встречу',
  appointmentNote: 'Скоро здесь появится календарь и график записи на встречу.',
} as const;
