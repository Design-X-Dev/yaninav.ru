import 'server-only';

import { getPayload } from 'payload';
import config from '@payload-config';

import { MEMORIES_GLOBAL_SLUG } from '@/payload/globals/Memories';
import type { MemoriesContent, MemoriesSlide } from '@/types/memories';

export type { MemoriesContent, MemoriesSlide };

function pickUrl(media: unknown): string {
  if (!media || typeof media !== 'object') return '';
  const m = media as { url?: string; sizes?: { card?: { url?: string | null } | null } | null };
  const card = m.sizes?.card?.url;
  if (typeof card === 'string' && card.trim()) return card;
  if (typeof m.url === 'string' && m.url.trim()) return m.url;
  return '';
}

export async function getMemoriesContent(): Promise<MemoriesContent> {
  const p = await getPayload({ config });
  const data = await p.findGlobal({
    slug: MEMORIES_GLOBAL_SLUG,
    depth: 2,
    overrideAccess: true,
  });

  if (data?.enabled === false) {
    return {
      heading: '',
      subheading: '',
      description: '',
      slides: [],
    };
  }

  const rawSlides = Array.isArray(data?.slides) ? data.slides : [];
  const slides: MemoriesSlide[] = rawSlides
    .map((s, i) => ({
      id: i + 1,
      text: typeof s?.text === 'string' ? s.text : '',
      image: pickUrl(s?.image),
    }))
    .filter((row) => Boolean(row.image && row.text));

  /** Карусель в UI рассчитана на минимум 5 слайдов — иначе не рендерим блок на странице. */
  const safeSlides = slides.length >= 5 ? slides : [];

  return {
    heading: typeof data?.heading === 'string' ? data.heading : '',
    subheading: typeof data?.subheading === 'string' ? data.subheading : '',
    description: typeof data?.description === 'string' ? data.description : '',
    slides: safeSlides,
  };
}
