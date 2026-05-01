import type { Payload } from 'payload';

import { CONTACT_FORM_SLUG, contactFormSeedData } from './contactFormDefinition';

/** При старте Payload: создаёт форму `contact`, если документа нет. Изменения из админки не перезаписываются. */
export async function seedContactFormIfMissing(payload: Payload): Promise<void> {
  try {
    const found = await payload.find({
      collection: 'forms',
      where: { slug: { equals: CONTACT_FORM_SLUG } },
      limit: 1,
      depth: 0,
    });

    if (found.docs.length > 0) return;

    await payload.create({
      collection: 'forms',
      data: contactFormSeedData,
    });

    payload.logger.info({
      msg: `[payload] Forms: auto-created slug="${CONTACT_FORM_SLUG}" (onInit)`,
    });
  } catch (err) {
    payload.logger.error({
      err,
      msg: `[payload] Forms: auto-seed slug="${CONTACT_FORM_SLUG}" failed — создайте вручную в /admin или npm run seed:contact-form`,
    });
  }
}
