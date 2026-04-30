import { Suspense } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import FavoritesClient from '@/components/FavoritesClient';
import { SECTIONS } from '@/utils/theme';
import { getAllProducts } from '@/lib/products.server';

export default async function FavoritesPage() {
  const products = getAllProducts();
  const { bg } = SECTIONS.hero;

  return (
    <main>
      <Suspense>
        <Header sectionColor={bg} />
      </Suspense>
      <FavoritesClient products={products} />
      <Footer />
    </main>
  );
}
