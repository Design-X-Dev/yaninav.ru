import type { Payload } from 'payload';

import { CONTACT_CHANNEL_DEFAULTS, CONTACT_SECTION_DEFAULTS } from '../../lib/contact.defaults';

import { CONTACT_GLOBAL_SLUG } from '../globals/Contact';

function trim(v: unknown): string {
  return typeof v === 'string' ? v.trim() : '';
}

export async function seedContactGlobalIfMissing(payload: Payload): Promise<void> {
  const doc = await payload.findGlobal({
    slug: CONTACT_GLOBAL_SLUG,
    depth: 0,
    overrideAccess: true,
  });

  const heading = typeof doc?.heading === 'string' ? doc.heading.trim() : '';
  if (heading.length > 0) return;

  try {
    await payload.updateGlobal({
      slug: CONTACT_GLOBAL_SLUG,
      overrideAccess: true,
      depth: 0,
      data: {
        enabled: true,
        heading: CONTACT_SECTION_DEFAULTS.heading,
        intro: CONTACT_SECTION_DEFAULTS.intro,
        contactInfoHeading: CONTACT_SECTION_DEFAULTS.contactInfoHeading,
        address: CONTACT_SECTION_DEFAULTS.address,
        hours: CONTACT_SECTION_DEFAULTS.hours,
        phoneDisplay: CONTACT_CHANNEL_DEFAULTS.phoneDisplay,
        phoneHref: CONTACT_CHANNEL_DEFAULTS.phoneHref,
        emailDisplay: CONTACT_CHANNEL_DEFAULTS.emailDisplay,
        emailHref: CONTACT_CHANNEL_DEFAULTS.emailHref,
        formHeading: CONTACT_SECTION_DEFAULTS.formHeading,
        appointmentButtonText: CONTACT_SECTION_DEFAULTS.appointmentButtonText,
        appointmentNote: CONTACT_SECTION_DEFAULTS.appointmentNote,
      },
    });

    payload.logger.info({ msg: `[payload] Global "${CONTACT_GLOBAL_SLUG}" заполнен дефолтными текстами` });
  } catch (err) {
    payload.logger.error({
      err,
      msg:
        `[payload] Auto-seed global "${CONTACT_GLOBAL_SLUG}" не удался — заполните вручную /admin/globals/` +
        CONTACT_GLOBAL_SLUG,
    });
  }
}

/** Дописывает телефон/email из дефолтов, если в старых БД поля пустые (перенос из кода в Payload). */
export async function ensureContactChannelsFromDefaults(payload: Payload): Promise<void> {
  const doc = await payload.findGlobal({
    slug: CONTACT_GLOBAL_SLUG,
    depth: 0,
    overrideAccess: true,
  });

  const pd = trim(doc.phoneDisplay);
  const ph = trim(doc.phoneHref);
  const ed = trim(doc.emailDisplay);
  const eh = trim(doc.emailHref);

  if (pd && ph && ed && eh) return;

  try {
    await payload.updateGlobal({
      slug: CONTACT_GLOBAL_SLUG,
      overrideAccess: true,
      depth: 0,
      data: {
        phoneDisplay: pd || CONTACT_CHANNEL_DEFAULTS.phoneDisplay,
        phoneHref: ph || CONTACT_CHANNEL_DEFAULTS.phoneHref,
        emailDisplay: ed || CONTACT_CHANNEL_DEFAULTS.emailDisplay,
        emailHref: eh || CONTACT_CHANNEL_DEFAULTS.emailHref,
      },
    });
    payload.logger.info({
      msg: `[payload] Global "${CONTACT_GLOBAL_SLUG}": дополнены телефон/email из дефолтов`,
    });
  } catch (err) {
    payload.logger.error({ err, msg: `[payload] ensureContactChannelsFromDefaults не удался` });
  }
}
