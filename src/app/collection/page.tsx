'use client';

import { Suspense } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Catalog from '@/components/Catalog';
import { SECTIONS } from '@/utils/theme';

function CatalogPageContent() {
  return (
    <main>
      <Header sectionColor={SECTIONS.catalog.bg} />
      <Catalog hideCategoryFilter />
      <Footer />
    </main>
  );
}

export default function CatalogPage() {
  return (
    <Suspense>
      <CatalogPageContent />
    </Suspense>
  );
}
