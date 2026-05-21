import 'server-only';

import { cache } from 'react';
import { getPayload } from 'payload';
import config from '@payload-config';

import { CONTACT_CHANNEL_DEFAULTS, CONTACT_SECTION_DEFAULTS } from '@/lib/contact.defaults';
import { CONTACT_GLOBAL_SLUG } from '@/payload/globals/Contact';

import type { ContactSectionContent } from '@/types/contact';

export type { ContactSectionContent };

export type SiteContactChannels = {
  phoneDisplay: string;
  phoneHref: string;
  emailDisplay: string;
  emailHref: string;
};

function trimStr(v: unknown): string {
  return typeof v === 'string' ? v.trim() : '';
}

/** Один запрос глобала «Контакты» на SSR-запрос (футер + секция + layout). */
export const loadContactGlobal = cache(async () => {
  const p = await getPayload({ config });
  return p.findGlobal({
    slug: CONTACT_GLOBAL_SLUG,
    depth: 0,
    overrideAccess: true,
  });
});

function channelsFromDoc(d: Record<string, unknown> | null | undefined): SiteContactChannels {
  return {
    phoneDisplay: trimStr(d?.phoneDisplay) || CONTACT_CHANNEL_DEFAULTS.phoneDisplay,
    phoneHref: trimStr(d?.phoneHref) || CONTACT_CHANNEL_DEFAULTS.phoneHref,
    emailDisplay: trimStr(d?.emailDisplay) || CONTACT_CHANNEL_DEFAULTS.emailDisplay,
    emailHref: trimStr(d?.emailHref) || CONTACT_CHANNEL_DEFAULTS.emailHref,
  };
}

/** Телефон и email для футера, кнопок товара и т.д. — из глобала «Контакты». */
export async function getSiteContactChannels(): Promise<SiteContactChannels> {
  try {
    const doc = await loadContactGlobal();
    return channelsFromDoc(doc as Record<string, unknown>);
  } catch {
    return { ...CONTACT_CHANNEL_DEFAULTS };
  }
}

function fallbackContactSection(): ContactSectionContent {
  return {
    heading: CONTACT_SECTION_DEFAULTS.heading,
    intro: CONTACT_SECTION_DEFAULTS.intro,
    contactInfoHeading: CONTACT_SECTION_DEFAULTS.contactInfoHeading,
    address: CONTACT_SECTION_DEFAULTS.address,
    hours: CONTACT_SECTION_DEFAULTS.hours,
    formHeading: CONTACT_SECTION_DEFAULTS.formHeading,
    appointmentButtonText: CONTACT_SECTION_DEFAULTS.appointmentButtonText,
    appointmentNote: CONTACT_SECTION_DEFAULTS.appointmentNote,
    ...CONTACT_CHANNEL_DEFAULTS,
  };
}

/** Секция скрыта в админке (`enabled === false`). Иначе — данные из глобала с fallback на дефолты. */
export async function getContactContent(): Promise<ContactSectionContent | null> {
  try {
    const doc = await loadContactGlobal();

    if (doc?.enabled === false) return null;

    const d = doc as Record<string, unknown> | null | undefined;

    const heading = trimStr(d?.heading) || CONTACT_SECTION_DEFAULTS.heading;
    const intro = trimStr(d?.intro) || CONTACT_SECTION_DEFAULTS.intro;
    const contactInfoHeading =
      trimStr(d?.contactInfoHeading) || CONTACT_SECTION_DEFAULTS.contactInfoHeading;
    const address = trimStr(d?.address) || CONTACT_SECTION_DEFAULTS.address;
    const hours = trimStr(d?.hours) || CONTACT_SECTION_DEFAULTS.hours;
    const formHeading = trimStr(d?.formHeading) || CONTACT_SECTION_DEFAULTS.formHeading;
    const appointmentButtonText =
      trimStr(d?.appointmentButtonText) || CONTACT_SECTION_DEFAULTS.appointmentButtonText;
    const appointmentNote = trimStr(d?.appointmentNote) || CONTACT_SECTION_DEFAULTS.appointmentNote;

    const { phoneDisplay, phoneHref, emailDisplay, emailHref } = channelsFromDoc(d);

    return {
      heading,
      intro,
      contactInfoHeading,
      address,
      hours,
      phoneDisplay,
      phoneHref,
      emailDisplay,
      emailHref,
      formHeading,
      appointmentButtonText,
      appointmentNote,
    };
  } catch {
    return fallbackContactSection();
  }
}
