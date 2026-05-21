import 'server-only';

import { getPayload } from 'payload';
import config from '@payload-config';
import {
  pickLocalizedRelationValue,
  pickLocalizedString,
} from '@/lib/seoHelpers';
import type { Product as UiProduct } from '@/utils/products';

type MediaLike = {
  id: number;
  url?: string | null;
  sizes?: {
    card?: { url?: string | null };
    hero?: { url?: string | null };
    og?: { url?: string | null };
  };
};

type PayloadMetaGroup = {
  title?: unknown;
  description?: unknown;
  image?: unknown;
} | null | undefined;

type CategoryLike = {
  id: number;
  name: string;
  slug: string;
  meta?: PayloadMetaGroup;
};

type ProductDoc = {
  id: number;
  name: string;
  description: string;
  descriptionEnd?: string | null;
  price?: number | null;
  category: number | CategoryLike;
  image: number | MediaLike;
  image2?: number | MediaLike | null;
  image3?: number | MediaLike | null;
  bannerImage?: number | MediaLike | null;
  characteristics?: { key: string; value: string }[] | null;
  meta?: PayloadMetaGroup;
};

function resolveMediaUrl(media: number | MediaLike | null | undefined): string {
  if (media == null || typeof media === 'number') return '';
  const m = media as MediaLike;
  return m.sizes?.card?.url || m.url || '';
}

function mapMetaFromDoc(
  meta: PayloadMetaGroup,
  imageFallback: number | MediaLike | null | undefined
): UiProduct['meta'] | undefined {
  const title = meta ? pickLocalizedString(meta.title) : undefined;
  const description = meta ? pickLocalizedString(meta.description) : undefined;
  const imageRel = meta ? pickLocalizedRelationValue<MediaLike | number>(meta.image) : undefined;
  const imageUrl = resolveMediaUrl(imageRel ?? undefined) || resolveMediaUrl(imageFallback);
  const out: NonNullable<UiProduct['meta']> = {
    ...(title ? { title } : {}),
    ...(description ? { description } : {}),
    ...(imageUrl ? { image: imageUrl } : {}),
  };
  return Object.keys(out).length ? out : undefined;
}

function docToUi(doc: ProductDoc): UiProduct {
  const cat = typeof doc.category === 'number' ? null : doc.category;
  const price = doc.price;

  return {
    id: doc.id,
    name: doc.name,
    description: doc.description,
    descriptionEnd: doc.descriptionEnd ?? undefined,
    price: price == null ? null : price,
    category: cat?.name ?? '',
    image: resolveMediaUrl(doc.image),
    image2: (() => {
      const u = resolveMediaUrl(doc.image2 ?? undefined);
      return u || undefined;
    })(),
    image3: (() => {
      const u = resolveMediaUrl(doc.image3 ?? undefined);
      return u || undefined;
    })(),
    bannerImage: (() => {
      const u = resolveMediaUrl(doc.bannerImage ?? undefined);
      return u || undefined;
    })(),
    characteristics: doc.characteristics?.map((c) => ({ key: c.key, value: c.value })),
    meta: mapMetaFromDoc(doc.meta ?? null, doc.image),
  };
}

let cached: Awaited<ReturnType<typeof getPayload>> | null = null;

async function payload() {
  cached ??= await getPayload({ config });
  return cached;
}

export async function getAllProducts(): Promise<UiProduct[]> {
  const p = await payload();
  const { docs } = await p.find({
    collection: 'products',
    depth: 2,
    limit: 300,
    sort: 'id',
  });

  return docs.map((d) => docToUi(d as unknown as ProductDoc));
}

export async function getProductById(id: number): Promise<UiProduct | undefined> {
  const p = await payload();
  const { docs } = await p.find({
    collection: 'products',
    depth: 2,
    limit: 1,
    where: {
      id: {
        equals: id,
      },
    },
  });
  const doc = docs[0] as unknown as ProductDoc | undefined;
  return doc ? docToUi(doc) : undefined;
}

/** Порядок `ids` сохраняется; отсутствующие id пропускаются. */
export async function getProductsByIdsOrdered(ids: number[]): Promise<UiProduct[]> {
  const uniq = [...new Set(ids.filter((id) => typeof id === 'number' && Number.isFinite(id)))];
  if (uniq.length === 0) return [];

  const p = await payload();
  const { docs } = await p.find({
    collection: 'products',
    depth: 2,
    limit: uniq.length,
    where: {
      id: {
        in: uniq,
      },
    },
  });

  const byId = new Map<number, UiProduct>();
  for (const d of docs) {
    const doc = d as unknown as ProductDoc;
    byId.set(doc.id, docToUi(doc));
  }

  return uniq.map((id) => byId.get(id)).filter((x): x is UiProduct => x != null);
}

export async function getProductsByCategory(slug: string): Promise<UiProduct[]> {
  if (!slug || slug === 'all') return getAllProducts();

  const p = await payload();
  const s = slug.toLowerCase().trim();
  const { docs } = await p.find({
    collection: 'products',
    depth: 2,
    limit: 300,
    sort: 'id',
    where: {
      'category.slug': {
        equals: s,
      },
    },
  });

  const seen = new Set<number>();
  return docs
    .map((d) => docToUi(d as unknown as ProductDoc))
    .filter((item) => {
      if (seen.has(item.id)) return false;
      seen.add(item.id);
      return Boolean(item.category);
    });
}

export async function getAllCategories(): Promise<{ id: string; name: string }[]> {
  const p = await payload();
  const { docs } = await p.find({
    collection: 'categories',
    depth: 0,
    limit: 100,
    sort: 'order',
  });

  const mapped = docs.map((c) => ({
    id: (c as CategoryLike).slug,
    name: (c as CategoryLike).name,
  }));
  return [{ id: 'all', name: 'Все изделия' }, ...mapped];
}

export async function getCategoriesForNav(): Promise<{ id: string; name: string }[]> {
  const p = await payload();
  const { docs } = await p.find({
    collection: 'categories',
    depth: 0,
    limit: 100,
    sort: 'order',
  });

  return [{ id: 'all', name: 'Все изделия' }, ...docs.map((c) => ({
    id: (c as CategoryLike).slug,
    name: (c as CategoryLike).name,
  }))];
}

/** Для `generateMetadata` страницы `/collection?category=…`. */
export async function getCategoryBySlug(
  slug: string
): Promise<{
  name: string;
  slug: string;
  meta?: UiProduct['meta'];
} | null> {
  const normalized = slug.toLowerCase().trim();
  if (!normalized || normalized === 'all') return null;

  const p = await payload();
  const { docs } = await p.find({
    collection: 'categories',
    depth: 2,
    limit: 1,
    where: { slug: { equals: normalized } },
  });

  const doc = docs[0] as unknown as CategoryLike | undefined;
  if (!doc) return null;

  const title = pickLocalizedString(doc.meta?.title);
  const description = pickLocalizedString(doc.meta?.description);
  const imageRel = pickLocalizedRelationValue<MediaLike | number>(doc.meta?.image);
  const imageUrl = resolveMediaUrl(imageRel);

  const meta: NonNullable<UiProduct['meta']> = {
    ...(title ? { title } : {}),
    ...(description ? { description } : {}),
    ...(imageUrl ? { image: imageUrl } : {}),
  };

  return {
    name: doc.name,
    slug: doc.slug,
    meta: Object.keys(meta).length ? meta : undefined,
  };
}
