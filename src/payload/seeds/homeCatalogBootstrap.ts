import type { Payload } from 'payload';

import { HOME_CATALOG_GLOBAL_SLUG } from '../globals/HomeCatalog';

/** Значения по умолчанию для глобала «Наша коллекция», если документ ещё не настроен. */
export async function seedHomeCatalogIfMissing(payload: Payload): Promise<void> {
  const doc = await payload.findGlobal({
    slug: HOME_CATALOG_GLOBAL_SLUG,
    depth: 0,
    overrideAccess: true,
  });

  const mode = (doc as { selectionMode?: unknown })?.selectionMode;
  if (typeof mode === 'string' && mode.trim().length > 0) return;

  try {
    await payload.updateGlobal({
      slug: HOME_CATALOG_GLOBAL_SLUG,
      overrideAccess: true,
      depth: 0,
      data: {
        enabled: true,
        selectionMode: 'catalog',
        manualProducts: [],
      },
    });

    payload.logger.info({ msg: `[payload] Global "${HOME_CATALOG_GLOBAL_SLUG}" задан режим «Как в каталоге»` });
  } catch (err) {
    payload.logger.error({
      err,
      msg:
        `[payload] Auto-seed "${HOME_CATALOG_GLOBAL_SLUG}" не удался — заполните вручную /admin/globals/` +
        HOME_CATALOG_GLOBAL_SLUG,
    });
  }
}
