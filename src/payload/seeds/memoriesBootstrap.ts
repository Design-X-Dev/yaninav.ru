import path from 'node:path';

import fs from 'node:fs/promises';
import type { Payload } from 'payload';

import { MEMORIES_GLOBAL_SLUG } from '../globals/Memories';
import { MEMORY_DEFAULT_COPY, MEMORY_SLIDE_SOURCES } from './memoriesDefinition';

const MEDIA_SOURCE_PREFIX = 'home-memories/';

function countSlidesWithImages(slides: unknown): number {
  if (!Array.isArray(slides)) return 0;
  return slides.filter((row) => {
    if (!row || typeof row !== 'object') return false;
    const img = (row as { image?: unknown }).image;
    if (typeof img === 'number' && Number.isFinite(img) && img > 0) return true;
    if (img && typeof img === 'object' && typeof (img as { id?: unknown }).id === 'number') return true;
    return false;
  }).length;
}

async function ensureMemorySlideMedia(payload: Payload, fileName: string): Promise<number | null> {
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

  const absolute = path.resolve(process.cwd(), 'public/images', fileName);
  try {
    await fs.access(absolute);
  } catch {
    payload.logger.warn({ msg: `[payload] Memories seed: файл не найден: ${absolute}` });
    return null;
  }

  const created = await payload.create({
    collection: 'media',
    overrideAccess: true,
    filePath: absolute,
    data: {
      alt: `Воспоминания — ${fileName}`,
      sourceBasename,
    },
  });

  payload.logger.info({ msg: `[payload] Memories seed: media "${sourceBasename}" → id=${created.id}` });
  return created.id as number;
}

/**
 * Идемпотентно загружает 5 JPEG из `public/images/` → `media` и заполняет глобал `memories`.
 * При `force: false` пропуск, если уже ≥ 5 заполненных слайдов.
 */
export async function seedMemoriesFromDisk(payload: Payload, opts?: { force?: boolean }): Promise<void> {
  const force = opts?.force === true;

  if (!force) {
    const doc = await payload.findGlobal({
      slug: MEMORIES_GLOBAL_SLUG,
      depth: 0,
      overrideAccess: true,
    });
    if (countSlidesWithImages(doc.slides) >= 5) return;
  }

  try {
    const slides: { image: number; text: string }[] = [];

    for (const slide of MEMORY_SLIDE_SOURCES) {
      const mediaId = await ensureMemorySlideMedia(payload, slide.file);
      if (mediaId == null) {
        throw new Error(`Не удалось создать/найти media для slide ${slide.file}`);
      }
      slides.push({ image: mediaId, text: slide.text });
    }

    await payload.updateGlobal({
      slug: MEMORIES_GLOBAL_SLUG,
      overrideAccess: true,
      depth: 0,
      data: {
        heading: MEMORY_DEFAULT_COPY.heading,
        subheading: MEMORY_DEFAULT_COPY.subheading,
        description: MEMORY_DEFAULT_COPY.description,
        slides,
      },
    });

    payload.logger.info({
      msg: `[payload] Global "${MEMORIES_GLOBAL_SLUG}" заполнен из public/images (${slides.length} слайдов)`,
    });
  } catch (err) {
    payload.logger.error({
      err,
      msg:
        `[payload] Auto-seed global "${MEMORIES_GLOBAL_SLUG}" не удался — выполните вручную ` +
        '`npm run seed:memories` или добавьте слайды в /admin/globals/memories.',
    });
  }
}

/** onInit — не перезаписывает уже настроенный глобал. */
export async function seedMemoriesIfMissing(payload: Payload): Promise<void> {
  await seedMemoriesFromDisk(payload, { force: false });
}
