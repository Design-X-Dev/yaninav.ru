import 'server-only';

import { getPayload } from 'payload';
import config from '@payload-config';

import { localizedLexicalToPlain } from '@/lib/lexicalPlain';
import { pickLocalizedString } from '@/lib/seoHelpers';
import type { ContactSerializedForm, ContactSerializedFormField } from '@/types/contactFormSerialized';

const DEFAULT_THANK_YOU = 'Спасибо! Мы свяжемся с вами в ближайшее время.';

function mapBlockToField(block: unknown): ContactSerializedFormField | null {
  if (!block || typeof block !== 'object') return null;
  const b = block as Record<string, unknown>;
  const blockType = b.blockType as string | undefined;
  const name = typeof b.name === 'string' ? b.name.trim() : '';
  if (!name) return null;

  switch (blockType) {
    case 'text': {
      const inputType =
        name.toLowerCase().includes('phone') || name === 'tel' ? 'tel' : 'text';
      return {
        blockType: 'text',
        name,
        label: pickLocalizedString(b.label),
        required: Boolean(b.required),
        placeholder: pickLocalizedString(b.placeholder),
        defaultValue: pickLocalizedString(b.defaultValue),
        inputType,
      };
    }
    case 'email':
      return {
        blockType: 'email',
        name,
        label: pickLocalizedString(b.label),
        required: Boolean(b.required),
        placeholder: pickLocalizedString(b.placeholder),
        defaultValue: pickLocalizedString(b.defaultValue),
        inputType: 'email',
      };
    case 'number':
      return {
        blockType: 'number',
        name,
        label: pickLocalizedString(b.label),
        required: Boolean(b.required),
        placeholder: pickLocalizedString(b.placeholder),
        defaultValue:
          typeof b.defaultValue === 'number' ? String(b.defaultValue) : pickLocalizedString(b.defaultValue),
        inputType: 'number',
      };
    case 'textarea':
      return {
        blockType: 'textarea',
        name,
        label: pickLocalizedString(b.label),
        required: Boolean(b.required),
        placeholder: pickLocalizedString(b.placeholder),
        defaultValue: pickLocalizedString(b.defaultValue),
      };
    case 'checkbox':
      return {
        blockType: 'checkbox',
        name,
        label: pickLocalizedString(b.label),
        required: Boolean(b.required),
        defaultValue: typeof b.defaultValue === 'boolean' ? b.defaultValue : Boolean(b.defaultValue),
      };
    case 'select': {
      const rawOpts = Array.isArray(b.options) ? b.options : [];
      const options = rawOpts
        .map((o) => {
          if (!o || typeof o !== 'object') return null;
          const row = o as Record<string, unknown>;
          const value = typeof row.value === 'string' ? row.value : '';
          if (!value) return null;
          const label = pickLocalizedString(row.label) ?? value;
          return { label, value };
        })
        .filter((x): x is { label: string; value: string } => x != null);
      return {
        blockType: 'select',
        name,
        label: pickLocalizedString(b.label),
        required: Boolean(b.required),
        placeholder: pickLocalizedString(b.placeholder),
        defaultValue: pickLocalizedString(b.defaultValue),
        options,
      };
    }
    case 'country':
    case 'state':
    case 'radio':
    case 'date':
    case 'payment':
    case 'upload':
    case 'message':
      return null;
    default:
      return null;
  }
}

export function serializeFormDoc(doc: Record<string, unknown>): ContactSerializedForm {
  const fields: ContactSerializedFormField[] = [];
  const blocks = doc.fields;
  if (Array.isArray(blocks)) {
    for (const block of blocks) {
      const f = mapBlockToField(block);
      if (f) fields.push(f);
    }
  }
  const thankYou = localizedLexicalToPlain(doc.confirmationMessage) || DEFAULT_THANK_YOU;
  return {
    id: doc.id as string | number,
    submitButtonLabel: pickLocalizedString(doc.submitButtonLabel) ?? 'Отправить сообщение',
    confirmationMessagePlain: thankYou,
    fields,
  };
}

/** Форма с `slug`, подготовленная для клиентского `ContactForm`. */
export async function getSerializedContactForm(slug: string): Promise<ContactSerializedForm | null> {
  const payload = await getPayload({ config });
  const res = await payload.find({
    collection: 'forms',
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 0,
  });
  const doc = res.docs[0] as Record<string, unknown> | undefined;
  if (!doc) return null;
  return serializeFormDoc(doc);
}
