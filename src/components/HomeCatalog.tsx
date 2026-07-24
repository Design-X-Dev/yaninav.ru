'use client';

import { useState, useEffect } from 'react';
import Catalog from '@/components/Catalog';
import type { CatalogNavCategory, Product } from '@/utils/products';

export interface HomeCatalogProps {
  products: Product[];
  categories: CatalogNavCategory[];
}

function useResponsiveCatalogLimit() {
  const [limit, setLimit] = useState(4);
  useEffect(() => {
    const update = () => setLimit(window.innerWidth < 768 ? 4 : 6);
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);
  return limit;
}

function useHashScroll() {
  useEffect(() => {
    const scrollToHash = () => {
      const hash = window.location.hash;
      if (!hash) return;
      const el = document.getElementById(hash.slice(1));
      if (el) requestAnimationFrame(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }));
    };
    scrollToHash();
    window.addEventListener('hashchange', scrollToHash);
    return () => window.removeEventListener('hashchange', scrollToHash);
  }, []);
}

/**
 * Клиентская обёртка для главной: лимит колонок каталога по ширине экрана и скролл к якорям (#contact и т.п.).
 */
export default function HomeCatalog({ products, categories }: HomeCatalogProps) {
  const catalogLimit = useResponsiveCatalogLimit();
  useHashScroll();

  return (
    <Catalog
      products={products}
      categories={categories}
      limit={catalogLimit}
      showViewAll
      hideCategoryFilter
    />
  );
}
