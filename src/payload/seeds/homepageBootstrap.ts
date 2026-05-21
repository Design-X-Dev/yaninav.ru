import type { Payload } from 'payload';

import {
  HOMEPAGE_DEFAULT_DESCRIPTION,
  HOMEPAGE_DEFAULT_TITLE,
} from '../../lib/homepageMeta.defaults';
import { pickLocalizedString } from '../../lib/seoHelpers';

import { HOMEPAGE_GLOBAL_SLUG } from '../globals/Homepage';

/** Первичное заполнение meta главной из дефолтов сайта (до правок в админке). */
export async function seedHomepageSeoIfMissing(payload: Payload): Promise<void> {
  const doc = await payload.findGlobal({
    slug: HOMEPAGE_GLOBAL_SLUG,
    locale: 'ru',
    depth: 0,
    overrideAccess: true,
  });

  const meta = (doc as { meta?: { title?: unknown; description?: unknown } }).meta;
  const title = pickLocalizedString(meta?.title)?.trim() ?? '';
  const description = pickLocalizedString(meta?.description)?.trim() ?? '';

  if (title && description) return;

  await payload.updateGlobal({
    slug: HOMEPAGE_GLOBAL_SLUG,
    locale: 'ru',
    overrideAccess: true,
    data: {
      meta: {
        ...(title ? {} : { title: HOMEPAGE_DEFAULT_TITLE }),
        ...(description ? {} : { description: HOMEPAGE_DEFAULT_DESCRIPTION }),
      },
    },
  });

  payload.logger.info({ msg: `[payload] Homepage SEO: заполнены дефолтные meta (ru)` });
}
