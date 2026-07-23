'use client';

import { useState, useMemo, useCallback } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import type { Product } from '@/utils/products';

interface UseCatalogFilterOptions {
  products: Product[];
  categories: { id: string; name: string }[];
  limit?: number;
}

function categoryIdFromSearchParams(
  pathname: string,
  searchParams: ReturnType<typeof useSearchParams>,
  categories: { id: string; name: string }[],
): string | null {
  if (pathname !== '/collection') return null;
  const raw = searchParams.get('category');
  if (!raw) return 'all';
  const id = decodeURIComponent(raw).toLowerCase().trim();
  if (id === 'all' || categories.some((c) => c.id === id)) return id === 'all' ? 'all' : id;
  return 'all';
}

export function useCatalogFilter({
  products,
  categories,
  limit,
}: UseCatalogFilterOptions) {
  const [localCategory, setLocalCategory] = useState('all');
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  // On /collection derive from URL during render (no setState-in-effect).
  // Elsewhere keep local filter state (home catalog).
  const categoryFromUrl = useMemo(
    () => categoryIdFromSearchParams(pathname, searchParams, categories),
    [pathname, searchParams, categories],
  );
  const activeCategory = categoryFromUrl ?? localCategory;

  const handleCategoryChange = useCallback(
    (id: string) => {
      setLocalCategory(id);
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
