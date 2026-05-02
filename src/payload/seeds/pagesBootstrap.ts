import type { Payload } from 'payload';

import { PAGES_COLLECTION_SLUG } from '../collections/Pages';
import { PAGES_SEED } from './pagesDefinition';

export async function seedPagesFromDisk(payload: Payload, opts?: { force?: boolean }): Promise<void> {
  const force = opts?.force === true;

  for (const def of PAGES_SEED) {
    try {
      const existing = await payload.find({
        collection: PAGES_COLLECTION_SLUG,
        where: { slug: { equals: def.slug } },
        limit: 1,
        depth: 0,
        overrideAccess: true,
      });

      const doc = existing.docs[0];
      if (doc && !force) {
        continue;
      }

      if (doc && force) {
        await payload.delete({
          collection: PAGES_COLLECTION_SLUG,
          id: doc.id,
          overrideAccess: true,
        });
      }

      await payload.create({
        collection: PAGES_COLLECTION_SLUG,
        locale: 'ru',
        draft: false,
        overrideAccess: true,
        data: {
          title: def.titleRu,
          slug: def.slug,
          body: def.body as unknown as Record<string, unknown>,
          showLegalDivider: def.showLegalDivider ?? false,
        },
      });

      payload.logger.info({ msg: `[payload] Page seeded: ${def.slug}` });
    } catch (err) {
      payload.logger.error({
        err,
        msg: `[payload] seed page "${def.slug}" failed`,
      });
    }
  }
}

export async function seedPagesIfMissing(payload: Payload): Promise<void> {
  await seedPagesFromDisk(payload, { force: false });
}
