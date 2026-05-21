import 'server-only';

import { getPayload } from 'payload';
import config from '@payload-config';

import {
  pickLocalizedRelationValue,
  pickLocalizedString,
} from '@/lib/seoHelpers';

import { HOMEPAGE_GLOBAL_SLUG } from '@/payload/globals/Homepage';

export type HomepageMeta = {
  title?: string;
  description?: string;
  image?: string;
};

type MediaLike = {
  id?: number;
  url?: string | null;
  sizes?: {
    card?: { url?: string | null };
    og?: { url?: string | null };
  };
};

function resolveMediaUrl(media: number | MediaLike | null | undefined): string {
  if (media == null || typeof media === 'number') return '';
  const m = media as MediaLike;
  return m.sizes?.og?.url || m.sizes?.card?.url || m.url || '';
}

export async function getHomepageMeta(): Promise<HomepageMeta | null> {
  const p = await getPayload({ config });
  const doc = await p.findGlobal({
    slug: HOMEPAGE_GLOBAL_SLUG,
    locale: 'ru',
    depth: 2,
    overrideAccess: true,
  });

  if (!doc || typeof doc !== 'object') return null;

  const meta = (doc as { meta?: unknown }).meta;
  if (!meta || typeof meta !== 'object') return null;

  const m = meta as { title?: unknown; description?: unknown; image?: unknown };
  const title = pickLocalizedString(m.title)?.trim();
  const description = pickLocalizedString(m.description)?.trim();
  const imageRel = pickLocalizedRelationValue<MediaLike | number>(m.image);
  const imageUrl = resolveMediaUrl(imageRel ?? undefined);

  const out: HomepageMeta = {
    ...(title ? { title } : {}),
    ...(description ? { description } : {}),
    ...(imageUrl ? { image: imageUrl } : {}),
  };

  return Object.keys(out).length ? out : null;
}
