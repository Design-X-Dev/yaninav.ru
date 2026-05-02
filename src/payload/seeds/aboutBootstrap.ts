import type { Payload } from 'payload';

import { ABOUT_GLOBAL_SLUG } from '../globals/About';
import { ABOUT_FEATURES_SEED, ABOUT_HEADING, ABOUT_LEAD_LEXICAL } from './aboutDefinition';

/**
 * Заполняет глобал `about` из [`aboutDefinition`](./aboutDefinition.ts).
 * При `force: false` пропуск, если уже есть заголовок и хотя бы одна карточка.
 */
export async function seedAboutFromDisk(payload: Payload, opts?: { force?: boolean }): Promise<void> {
  const force = opts?.force === true;

  if (!force) {
    const doc = await payload.findGlobal({
      slug: ABOUT_GLOBAL_SLUG,
      depth: 0,
      overrideAccess: true,
    });
    const features = doc?.features;
    if (
      typeof doc?.heading === 'string' &&
      doc.heading.trim().length > 0 &&
      Array.isArray(features) &&
      features.length > 0
    ) {
      return;
    }
  }

  try {
    await payload.updateGlobal({
      slug: ABOUT_GLOBAL_SLUG,
      overrideAccess: true,
      depth: 0,
      data: {
        enabled: true,
        heading: ABOUT_HEADING,
        lead: ABOUT_LEAD_LEXICAL as unknown as Record<string, unknown>,
        features: ABOUT_FEATURES_SEED.map((row) => ({ ...row })),
      },
    });

    payload.logger.info({
      msg: `[payload] Global "${ABOUT_GLOBAL_SLUG}" заполнен (${ABOUT_FEATURES_SEED.length} карточек)`,
    });
  } catch (err) {
    payload.logger.error({
      err,
      msg:
        `[payload] Auto-seed global "${ABOUT_GLOBAL_SLUG}" не удался — выполните вручную ` +
        '`npm run seed:about` или заполните /admin/globals/about.',
    });
  }
}

export async function seedAboutIfMissing(payload: Payload): Promise<void> {
  await seedAboutFromDisk(payload, { force: false });
}
