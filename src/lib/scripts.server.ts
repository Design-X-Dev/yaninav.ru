import 'server-only';

import { unstable_cache } from 'next/cache';
import { cache } from 'react';
import { getPayload } from 'payload';
import config from '@payload-config';

import {
  SCRIPTS_COLLECTION_SLUG,
  type ScriptLocation,
} from '@/payload/collections/Scripts';

export type SiteScript = {
  id: string | number;
  name: string;
  code: string;
  location: ScriptLocation;
};

async function fetchActiveScripts(): Promise<SiteScript[]> {
  const p = await getPayload({ config });
  const res = await p.find({
    collection: SCRIPTS_COLLECTION_SLUG,
    where: { isActive: { equals: true } },
    depth: 0,
    limit: 100,
    pagination: false,
    overrideAccess: true,
  });
  return res.docs as unknown as SiteScript[];
}

/** Межзапросный кэш; сбрасывается тегом 'scripts' из revalidate-хуков. */
const loadActiveScriptsCached = unstable_cache(fetchActiveScripts, ['site-scripts'], {
  revalidate: 300,
  tags: ['scripts'],
});

/** Один запрос на SSR-рендер; результат сгруппирован по точке вставки. */
export const loadScriptsByLocation = cache(async () => {
  const docs = await loadActiveScriptsCached().catch((err) => {
    console.error('[scripts] load failed', err);
    return [] as SiteScript[];
  });
  const groups: Record<ScriptLocation, SiteScript[]> = {
    head_open: [],
    head_close: [],
    body_open: [],
    body_close: [],
  };
  for (const d of docs) {
    if (groups[d.location]) groups[d.location].push(d);
  }
  return groups;
});
