import { Suspense } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Catalog from '@/components/Catalog';
import { SECTIONS } from '@/utils/theme';

export default function CatalogPage() {
  return (
    <main>
      <Suspense>
        <Header sectionColor={SECTIONS.catalog.bg} />
      </Suspense>
      <Suspense>
        <Catalog hideCategoryFilter />
      </Suspense>
      <Footer />
    </main>
  );
}
