'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import type { Product } from '@/utils/products';

interface UseCatalogFilterOptions {
  products: Product[];
  categories: { id: string; name: string }[];
  limit?: number;
}

export function useCatalogFilter({
  products,
  categories,
  limit,
}: UseCatalogFilterOptions) {
  const [activeCategory, setActiveCategory] = useState('all');
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const syncCategoryFromUrl = useCallback(() => {
    if (pathname !== '/collection') return;
    const raw = searchParams.get('category');
    if (!raw) {
      setActiveCategory('all');
      return;
    }
    const id = decodeURIComponent(raw).toLowerCase().trim();
    if (id === 'all' || categories.some((c) => c.id === id)) setActiveCategory(id === 'all' ? 'all' : id);
  }, [pathname, searchParams, categories]);

  useEffect(() => {
    syncCategoryFromUrl();
  }, [syncCategoryFromUrl]);

  const handleCategoryChange = useCallback(
    (id: string) => {
      setActiveCategory(id);
      if (pathname === '/collection') {
        const q = id === 'all' ? '' : `?category=${encodeURIComponent(id)}`;
        router.replace(`/collection${q}`, { scroll: false });
      }
    },
    [pathname, router],
  );

  const displayedProducts = useMemo(() => {
    const filtered =
      activeCategory === 'all'
        ? products
        : products.filter((p) => Boolean(p.categorySlug) && p.categorySlug === activeCategory);
    const seen = new Set<number>();
    const unique = filtered.filter((p) => {
      if (seen.has(p.id)) return false;
      seen.add(p.id);
      return true;
    });
    return limit != null && limit > 0 ? unique.slice(0, limit) : unique;
  }, [products, activeCategory, limit]);

  return { activeCategory, displayedProducts, handleCategoryChange };
}
