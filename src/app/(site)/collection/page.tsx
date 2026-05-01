import { Suspense } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Catalog from '@/components/Catalog';
import { SECTIONS } from '@/utils/theme';
import { getAllProducts, getCategoriesForNav } from '@/lib/products.server';

export const dynamic = 'force-dynamic';

/** Категорию из URL читает `Catalog` на клиенте (`useSearchParams`). */
export default async function CatalogPage() {
  const [products, categories] = await Promise.all([
    getAllProducts(),
    getCategoriesForNav(),
  ]);

  return (
    <main>
      <Suspense>
        <Header sectionColor={SECTIONS.catalog.bg} categories={categories} />
      </Suspense>
      <Suspense>
        <Catalog products={products} categories={categories} hideCategoryFilter />
      </Suspense>
      <Footer />
    </main>
  );
}
