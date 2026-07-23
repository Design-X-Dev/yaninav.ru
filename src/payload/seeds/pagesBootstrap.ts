import type { Payload } from 'payload';

import { pickLocalizedString } from '@/lib/seoHelpers';

import { PAGES_COLLECTION_SLUG } from '../collections/Pages';
import { PAGES_SEED } from './pagesDefinition';

/** Есть ли сохранённое Lexical-состояние (в т.ч. в карте локалей). */
function hasLocalizedLexicalBody(value: unknown): boolean {
  if (value != null && typeof value === 'object' && 'root' in (value as object)) return true;
  if (typeof value === 'object' && value !== null) {
    const preferredKeys = ['ru', 'ru-RU', 'en', 'en-US'];
    for (const key of preferredKeys) {
      const inner = (value as Record<string, unknown>)[key];
      if (inner != null && typeof inner === 'object' && 'root' in inner) return true;
    }
    for (const inner of Object.values(value)) {
      if (inner != null && typeof inner === 'object' && 'root' in inner) return true;
    }
  }
  return false;
}

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
        const ruDoc = await payload.findByID({
          collection: PAGES_COLLECTION_SLUG,
          id: doc.id,
          locale: 'ru',
          depth: 0,
          overrideAccess: true,
        });

        const titleRu =
          pickLocalizedString((ruDoc as { title?: unknown }).title)?.trim() ?? '';
        const hasBody = hasLocalizedLexicalBody((ruDoc as { body?: unknown }).body);

        if (titleRu && hasBody) {
          const status = (doc as { _status?: string })._status;
          if (status !== 'published') {
            // Payload: draft:false alone does NOT publish — need explicit _status.
            await payload.update({
              collection: PAGES_COLLECTION_SLUG,
              id: doc.id,
              locale: 'ru',
              draft: false,
              overrideAccess: true,
              data: { _status: 'published' },
            });
            payload.logger.info({ msg: `[payload] Page published (was ${status ?? 'unset'}): ${def.slug}` });
          }
          continue;
        }

        await payload.update({
          collection: PAGES_COLLECTION_SLUG,
          id: doc.id,
          locale: 'ru',
          draft: false,
          overrideAccess: true,
          data: {
            _status: 'published',
            ...(titleRu ? {} : { title: def.titleRu }),
            ...(hasBody ? {} : { body: def.body as unknown as Record<string, unknown> }),
          },
        });

        payload.logger.info({ msg: `[payload] Page ru backfill: ${def.slug}` });
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
          body: def.body as never,
          showLegalDivider: def.showLegalDivider ?? false,
          _status: 'published',
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
