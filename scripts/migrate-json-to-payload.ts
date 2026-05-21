/**
 * Одноразовый / повторный импорт данных каталога из `src/data/products.json` → Payload SQLite.
 *
 * После финального деплоя исходный JSON удаляется из репозитория (см. план Payload); восстановление —
 * из истории git или экспорт из админки Payload.
 *
 * Запуск: `npm run migrate:payload` (сначала сборка локального bundle через esbuild — без tsx/loadEnv-бага на Node ≥22).
 * До первого импорта создайте админа в `/admin`.
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

import config from '../payload.config';
import { getPayload } from 'payload';

import { nbspAfterSi } from '../src/utils/typography';

interface JsonCharacteristic {
  key: string;
  value: string;
}

interface JsonProduct {
  id: number;
  image: string;
  category: string;
  name: string;
  description: string;
  descriptionEnd?: string;
  price?: number | null;
  bannerImage?: string;
  image2?: string;
  image3?: string;
  characteristics?: JsonCharacteristic[];
}

const SMALL_SUFFIX = '_small';

/** Бывший `CATALOG_NAV_ORDER` без `all`. */
const LEGACY_CATALOG_NAV_SLUG_ORDER = [
  'помолвочные-кольца',
  'кольца-с-цветными-камнями',
  'кольца-с-бриллиантами',
  'женские-обручальные-кольца',
  'мужские-обручальные-кольца',
  'обручальные-кольца',
  'серьги-и-пусеты',
];

function slugForCategory(category: string): string {
  return category.trim().toLowerCase().replace(/\s+/g, '-');
}

function toSmallProductImageFileName(imageName: string): string {
  const t = imageName.trim();
  if (!t) return t;
  const lastDot = t.lastIndexOf('.');
  if (lastDot <= 0) return `${t}${SMALL_SUFFIX}`;
  const base = t.slice(0, lastDot);
  const ext = t.slice(lastDot);
  if (base.toLowerCase().endsWith(SMALL_SUFFIX)) return t;
  return `${base}${SMALL_SUFFIX}${ext}`;
}

function sortOrder(slug: string): number {
  const idx = LEGACY_CATALOG_NAV_SLUG_ORDER.indexOf(
    slug as (typeof LEGACY_CATALOG_NAV_SLUG_ORDER)[number]
  );
  return idx >= 0 ? (idx + 1) * 10 : 500;
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PRODUCTS_JSON_PATH = path.resolve(__dirname, '../src/data/products.json');

async function main() {
  const payload = await getPayload({ config });

  const jsonRaw = JSON.parse(await fs.readFile(PRODUCTS_JSON_PATH, 'utf8')) as JsonProduct[];

  const slugToCatId = new Map<string, number>();

  const categoryTuples = [...new Map(jsonRaw.map((p) => [p.category.trim(), slugForCategory(p.category)]))]
    .map(([displayName, slug]) => ({
      slug,
      displayName: displayName.trim(),
    }))
    .sort((a, b) => sortOrder(a.slug) - sortOrder(b.slug));

  for (const { displayName: nameRaw, slug } of categoryTuples) {
    const exists = await payload.find({
      collection: 'categories',
      where: { slug: { equals: slug } },
      depth: 0,
      limit: 1,
    });

    let id: number;

    if (exists.docs.length) {
      id = exists.docs[0].id as number;
    } else {
      const created = await payload.create({
        collection: 'categories',
        overrideAccess: true,
        data: {
          name: nbspAfterSi(nameRaw),
          slug,
          order: sortOrder(slug),
        },
      });
      id = created.id as number;
    }

    slugToCatId.set(slug, id);
    console.info(`Категория "${nameRaw}" (${slug}) → id ${id}`);
  }

  async function ensureMedia(origFileNameRaw: string | undefined | null): Promise<number | null> {
    const origFileName = (origFileNameRaw ?? '').trim();
    if (!origFileName) return null;

    const found = await payload.find({
      collection: 'image',
      limit: 1,
      depth: 0,
      where: { sourceBasename: { equals: origFileName } },
    });

    if (found.docs.length) {
      return found.docs[0].id as number;
    }

    const smallName = toSmallProductImageFileName(origFileName);
    const absolute = path.resolve(process.cwd(), 'public/images/products', smallName);

    try {
      await fs.access(absolute);
    } catch {
      console.warn(`Нет файла ${absolute} — пропуск медиа ${origFileName}`);
      return null;
    }

    const created = await payload.create({
      collection: 'image',
      overrideAccess: true,
      filePath: absolute,
      data: {
        alt: nbspAfterSi(origFileName),
        sourceBasename: origFileName,
      },
    });

    console.info(`Media "${origFileName}" → id ${created.id}`);
    return created.id as number;
  }

  for (const p of jsonRaw) {
    const name = nbspAfterSi(p.name.trim());
    const slug = slugForCategory(p.category);

    const dup = await payload.find({
      collection: 'products',
      where: { name: { equals: name } },
      limit: 1,
      depth: 0,
    });
    if (dup.docs.length) {
      console.warn(`Уже есть товар "${name}" — пропуск`);
      continue;
    }

    const catId = slugToCatId.get(slug);
    if (!catId) throw new Error(`Нет категории для slug ${slug}`);

    const imageId = await ensureMedia(p.image);
    if (!imageId) throw new Error(`Нет главного изображения для "${name}"`);

    const image2Id = await ensureMedia(p.image2 ?? undefined);
    const image3Id = await ensureMedia(p.image3 ?? undefined);
    const bannerId = await ensureMedia(
      typeof p.bannerImage === 'string' && p.bannerImage.trim() !== '' ? p.bannerImage : undefined
    );

    const characteristics =
      p.characteristics?.map((c) => ({
        key: nbspAfterSi(c.key.trim()),
        value: nbspAfterSi(c.value.trim()),
      })) ?? [];

    const payloadData: Record<string, unknown> = {
      name,
      description: nbspAfterSi(p.description),
      category: catId,
      image: imageId,
      ...(typeof p.descriptionEnd === 'string' && p.descriptionEnd.trim() !== ''
        ? { descriptionEnd: nbspAfterSi(p.descriptionEnd) }
        : {}),
      ...(typeof p.price === 'number' ? { price: p.price } : {}),
      ...(image2Id ? { image2: image2Id } : {}),
      ...(image3Id ? { image3: image3Id } : {}),
      ...(bannerId ? { bannerImage: bannerId } : {}),
      ...(characteristics.length ? { characteristics } : {}),
    };

    const created = await payload.create({
      collection: 'products',
      overrideAccess: true,
      depth: 0,
      data: payloadData as never,
    });
    console.info(`Товар "${name}" → id ${created.id} (бывший json id ${p.id})`);
  }

  console.info('Импорт завершён.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
