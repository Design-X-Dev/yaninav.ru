import 'server-only';

import { unstable_cache } from 'next/cache';
import { getPayload } from 'payload';
import config from '@payload-config';

import { HERO_GLOBAL_SLUG } from '@/payload/globals/Hero';
import type { HeroContent, HeroVideoSource } from '@/types/hero';

export type { HeroContent, HeroVideoSource };

const GLOBALS_REVALIDATE = 60;

/** Как в memories: для постера предпочитаем `sizes.card`, иначе основной `url`. */
function pickPosterUrl(media: unknown): string {
  if (!media || typeof media !== 'object') return '';
  const m = media as { url?: string; sizes?: { card?: { url?: string | null } | null } | null };
  const card = m.sizes?.card?.url;
  if (typeof card === 'string' && card.trim()) return card;
  if (typeof m.url === 'string' && m.url.trim()) return m.url;
  return '';
}

function pickVideoUrl(upload: unknown): string {
  if (!upload || typeof upload !== 'object') return '';
  const m = upload as { url?: string };
  if (typeof m.url === 'string' && m.url.trim()) return m.url;
  return '';
}

async function fetchHeroContent(): Promise<HeroContent | null> {
  const p = await getPayload({ config });
  const data = await p.findGlobal({
    slug: HERO_GLOBAL_SLUG,
    depth: 2,
    overrideAccess: true,
  });

  if (data?.enabled === false) return null;

  const poster = pickPosterUrl(data?.poster);
  const sources: HeroVideoSource[] = [
    { upload: data?.videoMp4, type: 'video/mp4' },
    { upload: data?.videoWebm, type: 'video/webm' },
  ]
    .map(({ upload, type }) => ({ src: pickVideoUrl(upload), type }))
    .filter((s) => Boolean(s.src));

  if (!poster || sources.length === 0) return null;

  const overlayText =
    typeof data?.overlayText === 'string' && data.overlayText.trim()
      ? data.overlayText
      : 'Смотреть видео';

  return {
    overlayText,
    poster,
    sources,
  };
}

export async function getHeroContent(): Promise<HeroContent | null> {
  return unstable_cache(fetchHeroContent, ['hero-content'], {
    revalidate: GLOBALS_REVALIDATE,
    tags: ['globals'],
  })();
}
