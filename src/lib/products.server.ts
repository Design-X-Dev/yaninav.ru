import 'server-only';

import { getPayload } from 'payload';
import config from '@payload-config';
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

type CategoryLike = {
  id: number;
  name: string;
  slug: string;
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
};

function resolveMediaUrl(media: number | MediaLike | null | undefined): string {
  if (media == null || typeof media === 'number') return '';
  const m = media as MediaLike;
  return m.sizes?.card?.url || m.url || '';
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
