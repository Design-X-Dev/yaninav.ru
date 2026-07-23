import 'server-only';

import { unstable_cache } from 'next/cache';
import type { SerializedEditorState } from 'lexical';
import { getPayload } from 'payload';
import config from '@payload-config';

import {
  pickLocalizedRelationValue,
  pickLocalizedString,
} from '@/lib/seoHelpers';
import { PAGES_COLLECTION_SLUG } from '@/payload/collections/Pages';

type MediaLike = {
  id?: number;
  url?: string | null;
  sizes?: {
    card?: { url?: string | null };
    og?: { url?: string | null };
  };
};

type PayloadMetaGroup = {
  title?: unknown;
  description?: unknown;
  image?: unknown;
} | null | undefined;

export type CmsPageMeta = {
  title?: string;
  description?: string;
  image?: string;
};

export type CmsPage = {
  title: string;
  body: SerializedEditorState;
  showLegalDivider: boolean;
  meta?: CmsPageMeta;
};

const PAGES_REVALIDATE = 300;

function resolveMediaUrl(media: number | MediaLike | null | undefined): string {
  if (media == null || typeof media === 'number') return '';
  const m = media as MediaLike;
  return m.sizes?.og?.url || m.sizes?.card?.url || m.url || '';
}

function pickLocalizedLexical(value: unknown): SerializedEditorState | null {
  if (value != null && typeof value === 'object' && 'root' in (value as object)) {
    return value as SerializedEditorState;
  }
  if (typeof value === 'object' && value !== null) {
    const preferredKeys = ['ru', 'ru-RU', 'en', 'en-US'];
    for (const key of preferredKeys) {
      const inner = (value as Record<string, unknown>)[key];
      if (inner != null && typeof inner === 'object' && 'root' in inner) {
        return inner as SerializedEditorState;
      }
    }
    for (const inner of Object.values(value)) {
      if (inner != null && typeof inner === 'object' && 'root' in inner) {
        return inner as SerializedEditorState;
      }
    }
  }
  return null;
}

function mapPageMeta(meta: PayloadMetaGroup): CmsPageMeta | undefined {
  const title = meta ? pickLocalizedString(meta.title) : undefined;
  const description = meta ? pickLocalizedString(meta.description) : undefined;
  const imageRel = meta ? pickLocalizedRelationValue<MediaLike | number>(meta.image) : undefined;
  const imageUrl = resolveMediaUrl(imageRel ?? undefined);
  const out: CmsPageMeta = {
    ...(title ? { title } : {}),
    ...(description ? { description } : {}),
    ...(imageUrl ? { image: imageUrl } : {}),
  };
  return Object.keys(out).length ? out : undefined;
}

async function fetchPageBySlug(slug: string): Promise<CmsPage | null> {
  const trimmed = slug.trim().toLowerCase();
  if (!trimmed) return null;

  const p = await getPayload({ config });

  const res = await p.find({
    collection: PAGES_COLLECTION_SLUG,
    where: {
      and: [
        { slug: { equals: trimmed } },
        { _status: { equals: 'published' } },
      ],
    },
    limit: 1,
    depth: 2,
    locale: 'ru',
    // Local API / SSR: access bypassed, but drafts must never reach the public site.
    overrideAccess: true,
  });

  const doc = res.docs[0];
  if (!doc || typeof doc !== 'object') return null;

  const title = pickLocalizedString((doc as { title?: unknown }).title);
  const body = pickLocalizedLexical((doc as { body?: unknown }).body);
  if (!title?.trim() || !body) return null;

  return {
    title: title.trim(),
    body,
    showLegalDivider: Boolean((doc as { showLegalDivider?: unknown }).showLegalDivider),
    meta: mapPageMeta((doc as { meta?: PayloadMetaGroup }).meta ?? null),
  };
}

export async function getPageBySlug(slug: string): Promise<CmsPage | null> {
  const trimmed = slug.trim().toLowerCase();
  return unstable_cache(() => fetchPageBySlug(trimmed), ['page-by-slug', trimmed], {
    revalidate: PAGES_REVALIDATE,
    tags: ['pages'],
  })();
}
