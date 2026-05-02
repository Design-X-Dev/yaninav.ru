import path from 'node:path';

import fs from 'node:fs/promises';
import type { Payload } from 'payload';

import { HERO_GLOBAL_SLUG } from '../globals/Hero';
import { HERO_SEED } from './heroDefinition';

const MEDIA_SOURCE_PREFIX = 'home-hero/';

function hasUploadRelation(field: unknown): boolean {
  if (typeof field === 'number' && Number.isFinite(field) && field > 0) return true;
  if (!field || typeof field !== 'object') return false;
  const id = (field as { id?: unknown }).id;
  return typeof id === 'number' && Number.isFinite(id) && id > 0;
}

async function ensureHeroPosterMedia(payload: Payload, fileName: string): Promise<number | null> {
  const sourceBasename = `${MEDIA_SOURCE_PREFIX}${fileName}`;

  const found = await payload.find({
    collection: 'media',
    limit: 1,
    depth: 0,
    where: { sourceBasename: { equals: sourceBasename } },
  });

  if (found.docs.length) {
    return found.docs[0].id as number;
  }

  const absolute = path.resolve(process.cwd(), 'public/videos', fileName);
  try {
    await fs.access(absolute);
  } catch {
    payload.logger.warn({ msg: `[payload] Hero seed: файл не найден (постер): ${absolute}` });
    return null;
  }

  const created = await payload.create({
    collection: 'media',
    overrideAccess: true,
    filePath: absolute,
    data: {
      alt: `Hero — ${fileName}`,
      sourceBasename,
    },
  });

  payload.logger.info({ msg: `[payload] Hero seed: media "${sourceBasename}" → id=${created.id}` });
  return created.id as number;
}

async function ensureHeroVideoMedia(payload: Payload, fileName: string): Promise<number | null> {
  const sourceBasename = `${MEDIA_SOURCE_PREFIX}${fileName}`;

  const found = await payload.find({
    collection: 'media-video',
    limit: 1,
    depth: 0,
    where: { sourceBasename: { equals: sourceBasename } },
  });

  if (found.docs.length) {
    return found.docs[0].id as number;
  }

  const absolute = path.resolve(process.cwd(), 'public/videos', fileName);
  try {
    await fs.access(absolute);
  } catch {
    payload.logger.warn({ msg: `[payload] Hero seed: файл не найден (видео): ${absolute}` });
    return null;
  }

  const created = await payload.create({
    collection: 'media-video',
    overrideAccess: true,
    filePath: absolute,
    data: {
      alt: `Hero — ${fileName}`,
      sourceBasename,
    },
  });

  payload.logger.info({ msg: `[payload] Hero seed: media-video "${sourceBasename}" → id=${created.id}` });
  return created.id as number;
}

/**
 * Загружает файлы Hero из `public/videos/` в `media` / `media-video` и заполняет глобал `hero`.
 * При `force: false` пропуск, если `poster` и `videoMp4` уже заданы.
 */
export async function seedHeroFromDisk(payload: Payload, opts?: { force?: boolean }): Promise<void> {
  const force = opts?.force === true;

  if (!force) {
    const doc = await payload.findGlobal({
      slug: HERO_GLOBAL_SLUG,
      depth: 0,
      overrideAccess: true,
    });
    if (hasUploadRelation(doc.poster) && hasUploadRelation(doc.videoMp4)) return;
  }

  try {
    const posterId = await ensureHeroPosterMedia(payload, HERO_SEED.poster.file);
    const mp4Id = await ensureHeroVideoMedia(payload, HERO_SEED.videoMp4.file);
    if (posterId == null || mp4Id == null) {
      throw new Error(
        `[payload] Hero seed: требуются файлы poster и mp4 (${HERO_SEED.poster.file}, ${HERO_SEED.videoMp4.file})`,
      );
    }

    let webmId: number | null = null;
    try {
      await fs.access(path.resolve(process.cwd(), 'public/videos', HERO_SEED.videoWebm.file));
      webmId = await ensureHeroVideoMedia(payload, HERO_SEED.videoWebm.file);
    } catch {
      payload.logger.warn({
        msg: `[payload] Hero seed: необязательный webm отсутствует — источник webm не подставится`,
      });
    }

    await payload.updateGlobal({
      slug: HERO_GLOBAL_SLUG,
      overrideAccess: true,
      depth: 0,
      data: {
        enabled: true,
        overlayText: HERO_SEED.overlayText,
        poster: posterId,
        videoMp4: mp4Id,
        videoWebm: webmId ?? null,
      },
    });

    payload.logger.info({
      msg: `[payload] Global "${HERO_GLOBAL_SLUG}" заполнен из public/videos (poster + mp4${webmId != null ? ' + webm' : ''})`,
    });
  } catch (err) {
    payload.logger.error({
      err,
      msg:
        `[payload] Auto-seed global "${HERO_GLOBAL_SLUG}" не удался — выполните вручную ` +
        '`npm run seed:hero` или заполните /admin/globals/hero.',
    });
  }
}

/** `onInit` — не перезаписывает уже настроенный глобал. */
export async function seedHeroIfMissing(payload: Payload): Promise<void> {
  await seedHeroFromDisk(payload, { force: false });
}
