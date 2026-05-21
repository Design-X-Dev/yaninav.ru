import 'server-only';

import { getPayload } from 'payload';
import config from '@payload-config';

import {
  HOME_CATALOG_GLOBAL_SLUG,
  type HomeCatalogSelectionMode,
} from '@/payload/globals/HomeCatalog';
import type { Product as UiProduct } from '@/utils/products';

import { getAllProducts, getProductsByIdsOrdered } from './products.server';

export type HomepageCatalogResult = {
  enabled: boolean;
  products: UiProduct[];
};

function stableShuffle<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/** Дороже первыми; «цена по запросу» (null) — в конце. */
function sortExpensiveFirst(a: UiProduct, b: UiProduct): number {
  const va = a.price ?? Number.NEGATIVE_INFINITY;
  const vb = b.price ?? Number.NEGATIVE_INFINITY;
  if (vb !== va) return vb - va;
  return a.id - b.id;
}

/** Дешевле первыми; «цена по запросу» — в конце. */
function sortCheapFirst(a: UiProduct, b: UiProduct): number {
  const va = a.price ?? Number.POSITIVE_INFINITY;
  const vb = b.price ?? Number.POSITIVE_INFINITY;
  if (va !== vb) return va - vb;
  return a.id - b.id;
}

function parseManualProductIds(raw: unknown): number[] {
  if (!Array.isArray(raw)) return [];
  const ids: number[] = [];
  for (const row of raw) {
    if (!row || typeof row !== 'object') continue;
    const product = (row as { product?: unknown }).product;
    if (typeof product === 'number' && Number.isFinite(product)) {
      ids.push(product);
      continue;
    }
    if (product && typeof product === 'object' && 'id' in product) {
      const id = (product as { id: unknown }).id;
      if (typeof id === 'number' && Number.isFinite(id)) ids.push(id);
    }
  }
  return ids;
}

function normalizeMode(raw: unknown): HomeCatalogSelectionMode {
  const m = typeof raw === 'string' ? raw.trim() : '';
  const allowed: HomeCatalogSelectionMode[] = [
    'catalog',
    'expensive',
    'cheap',
    'manual',
    'random',
  ];
  return allowed.includes(m as HomeCatalogSelectionMode) ? (m as HomeCatalogSelectionMode) : 'catalog';
}

export async function getHomepageCatalogProducts(): Promise<HomepageCatalogResult> {
  try {
    const p = await getPayload({ config });
    const doc = await p.findGlobal({
      slug: HOME_CATALOG_GLOBAL_SLUG,
      depth: 2,
      overrideAccess: true,
    });

    if (doc?.enabled === false) {
      return { enabled: false, products: [] };
    }

    const mode = normalizeMode((doc as { selectionMode?: unknown })?.selectionMode);

    if (mode === 'manual') {
      const ids = parseManualProductIds((doc as { manualProducts?: unknown }).manualProducts);
      const products = await getProductsByIdsOrdered(ids);
      return { enabled: true, products };
    }

    const all = await getAllProducts();

    if (mode === 'expensive') {
      return { enabled: true, products: [...all].sort(sortExpensiveFirst) };
    }
    if (mode === 'cheap') {
      return { enabled: true, products: [...all].sort(sortCheapFirst) };
    }
    if (mode === 'random') {
      return { enabled: true, products: stableShuffle(all) };
    }

    return { enabled: true, products: all };
  } catch {
    const products = await getAllProducts();
    return { enabled: true, products };
  }
}
