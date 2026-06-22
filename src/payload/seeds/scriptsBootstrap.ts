import type { Payload } from 'payload';

import { SCRIPTS_COLLECTION_SLUG } from '../collections/Scripts';
import { SCRIPTS_SEED } from './scriptsDefinition';

export async function seedScriptsFromDisk(
  payload: Payload,
  opts?: { force?: boolean },
): Promise<void> {
  const force = opts?.force === true;

  for (const def of SCRIPTS_SEED) {
    try {
      const existing = await payload.find({
        collection: SCRIPTS_COLLECTION_SLUG,
        where: { key: { equals: def.key } },
        limit: 1,
        depth: 0,
        overrideAccess: true,
      });

      if (existing.docs[0] && !force) continue;

      if (existing.docs[0] && force) {
        await payload.delete({
          collection: SCRIPTS_COLLECTION_SLUG,
          id: existing.docs[0].id,
          overrideAccess: true,
        });
      }

      await payload.create({
        collection: SCRIPTS_COLLECTION_SLUG,
        data: def as never,
        overrideAccess: true,
      });

      payload.logger.info({ msg: `[payload] Script seeded: ${def.key}` });
    } catch (err) {
      payload.logger.error({ err, msg: `[payload] seed script "${def.key}" failed` });
    }
  }
}

/** onInit — создаёт недостающие записи, не трогает уже настроенные. */
export async function seedScriptsIfMissing(payload: Payload): Promise<void> {
  await seedScriptsFromDisk(payload, { force: false });
}
