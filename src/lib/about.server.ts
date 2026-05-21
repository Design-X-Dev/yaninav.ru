import 'server-only';

import { unstable_cache } from 'next/cache';
import { getPayload } from 'payload';
import type { SerializedEditorState } from 'lexical';
import config from '@payload-config';

import { ABOUT_GLOBAL_SLUG } from '@/payload/globals/About';
import type { AboutContent, AboutFeature } from '@/types/about';
import { isAboutIconKey } from '@/types/about';

export type { AboutContent, AboutFeature };

const GLOBALS_REVALIDATE = 60;

async function fetchAboutContent(): Promise<AboutContent | null> {
  const p = await getPayload({ config });
  const data = await p.findGlobal({
    slug: ABOUT_GLOBAL_SLUG,
    depth: 0,
    overrideAccess: true,
  });

  if (data?.enabled === false) return null;

  const heading = typeof data?.heading === 'string' ? data.heading.trim() : '';
  const rawFeatures = Array.isArray(data?.features) ? data.features : [];

  const features: AboutFeature[] = rawFeatures
    .map((row) => {
      if (!row || typeof row !== 'object') return null;
      const r = row as { icon?: unknown; title?: unknown; description?: unknown };
      const icon = r.icon;
      const title = typeof r.title === 'string' ? r.title.trim() : '';
      const description = typeof r.description === 'string' ? r.description.trim() : '';
      if (!isAboutIconKey(icon) || !title || !description) return null;
      return { icon, title, description };
    })
    .filter((x): x is AboutFeature => x != null);

  if (!heading || features.length === 0) return null;

  const lead =
    data.lead && typeof data.lead === 'object' && data.lead !== null && 'root' in data.lead
      ? (data.lead as SerializedEditorState)
      : null;

  return {
    heading,
    lead,
    features,
  };
}

export async function getAboutContent(): Promise<AboutContent | null> {
  return unstable_cache(fetchAboutContent, ['about-content'], {
    revalidate: GLOBALS_REVALIDATE,
    tags: ['globals'],
  })();
}
