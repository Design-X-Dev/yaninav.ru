import 'server-only';

import rawProducts from '@/data/products.json';
import {
  type Product,
  CATALOG_NAV_ORDER,
  normalizeProductText,
  getCategorySlug,
} from '@/utils/products';

const PRODUCTS = rawProducts as Product[];

/** Уникальные товары по id (защита от дублей в json). */
function uniqueByIdNormalized(): Product[] {
  const map = new Map<number, Product>();
  for (const p of PRODUCTS) {
    if (!map.has(p.id)) {
      map.set(p.id, normalizeProductText(p));
    }
  }
  return [...map.values()];
}

export function getAllProducts(): Product[] {
  return uniqueByIdNormalized();
}

export function getProductById(id: number): Product | undefined {
  const p = PRODUCTS.find((item) => item.id === id);
  return p ? normalizeProductText(p) : undefined;
}

/** Фильтр по slug категории (B-10: без подстрочной эвристики). */
export function getProductsByCategory(slug: string): Product[] {
  if (!slug || slug === 'all') return getAllProducts();
  const s = slug.toLowerCase().trim();
  return getAllProducts().filter((p) => Boolean(p.category) && getCategorySlug(p.category) === s);
}

export function getAllCategories(): { id: string; name: string }[] {
  const categoriesMap = new Map<string, string>();
  getAllProducts().forEach((p) => {
    if (!p.category) return;
    const id = getCategorySlug(p.category);
    if (!categoriesMap.has(id)) categoriesMap.set(id, p.category);
  });
  const categories = Array.from(categoriesMap.entries()).map(([id, name]) => ({
    id,
    name,
  }));
  return [{ id: 'all', name: 'Все изделия' }, ...categories];
}

export function getCategoriesForNav(): { id: string; name: string }[] {
  const all = getAllCategories();
  const byId = new Map(all.map((c) => [c.id, c]));
  return CATALOG_NAV_ORDER.map((id) => byId.get(id)).filter(
    (c): c is { id: string; name: string } => c != null
  );
}
