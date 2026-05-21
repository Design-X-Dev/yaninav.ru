'use client';

import { nbspAfterSi } from '@/utils/typography';
import type { Product } from '@/utils/products';
import { useCatalogFilter } from '@/hooks/useCatalogFilter';
import CategoryFilterPills from './catalog/CategoryFilterPills';
import CatalogGrid from './catalog/CatalogGrid';
import CatalogEmptyState from './catalog/CatalogEmptyState';

interface CatalogProps {
  products: Product[];
  categories: { id: string; name: string }[];
  limit?: number;
  showViewAll?: boolean;
  hideCategoryFilter?: boolean;
  initialCategory?: string;
}

export default function Catalog({
  products,
  categories,
  limit,
  showViewAll = false,
  hideCategoryFilter = false,
  initialCategory,
}: CatalogProps) {
  const { activeCategory, displayedProducts, handleCategoryChange } = useCatalogFilter({
    products,
    categories,
    initialCategory,
    limit,
  });

  return (
    <section id="catalog" className="relative scroll-mt-28 pt-4 pb-20 bg-theme" suppressHydrationWarning>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4 text-accent-primary">
            Наша коллекция
          </h2>
          <p className="text-lg max-w-2xl mx-auto text-theme-secondary">
            {nbspAfterSi(
              'Откройте для себя мир изысканных украшений, созданных с любовью и вниманием к деталям',
            )}
          </p>
        </div>

        {!hideCategoryFilter && (
          <CategoryFilterPills
            categories={categories}
            activeCategory={activeCategory}
            onChange={handleCategoryChange}
          />
        )}

        {displayedProducts.length === 0 ? (
          <CatalogEmptyState />
        ) : (
          <CatalogGrid products={displayedProducts} showViewAll={showViewAll} />
        )}
      </div>
    </section>
  );
}
