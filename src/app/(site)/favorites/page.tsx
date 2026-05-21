import { Suspense } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import FavoritesClient from '@/components/FavoritesClient';
import { getAllProducts } from '@/lib/products.server';

export const revalidate = 60;

export default async function FavoritesPage() {
  const products = await getAllProducts();

  return (
    <main>
      <Suspense>
        <Header />
      </Suspense>
      <FavoritesClient products={products} />
      <Footer />
    </main>
  );
}
