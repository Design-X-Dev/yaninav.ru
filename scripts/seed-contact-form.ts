/**
 * Идемпотентно создаёт или обновляет форму главной страницы для `@payloadcms/plugin-form-builder`.
 *
 * Запуск: `PAYLOAD_SECRET=… DATABASE_URI=… npm run seed:contact-form`
 *
 * Данные формы синхронизированы с `src/payload/seeds/contactFormDefinition.ts`.
 * После каждого старта приложения форма дополнительно создаётся автоматически `onInit` в [`payload.config.ts`](../payload.config.ts), если slug ещё нет.
 */

import config from '../payload.config';
import { getPayload } from 'payload';

import { CONTACT_FORM_SLUG, contactFormSeedData } from '../src/payload/seeds/contactFormDefinition';

async function main(): Promise<void> {
  const payload = await getPayload({ config });

  const found = await payload.find({
    collection: 'forms',
    where: { slug: { equals: CONTACT_FORM_SLUG } },
    limit: 1,
  });

  const existing = found.docs[0];

  if (existing) {
    await payload.update({
      collection: 'forms',
      id: existing.id,
      // Lexical-подграф формы допускает в рантайме структуру из контактного сида,
      // строго сопоставить с автогёнными типами Form builder неудобно — скрипт «ручной».
      data: contactFormSeedData as never,
    });
    console.info(`Updated form slug=${CONTACT_FORM_SLUG} (id=${existing.id})`);
    return;
  }

  const created = await payload.create({
    collection: 'forms',
    data: contactFormSeedData as never,
  });

  console.info(`Created form slug=${CONTACT_FORM_SLUG} (id=${created.id})`);
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
