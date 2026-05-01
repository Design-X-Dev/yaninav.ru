import { Suspense } from 'react';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import MemoriesSection from '@/components/MemoriesSection';
import HomeCatalog from '@/components/HomeCatalog';
import About from '@/components/About';
import Contact from '@/components/Contact';
import Footer from '@/components/Footer';
import { SECTIONS } from '@/utils/theme';
import { getAllProducts, getCategoriesForNav } from '@/lib/products.server';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const [products, categories] = await Promise.all([
    getAllProducts(),
    getCategoriesForNav(),
  ]);

  return (
    <main>
      <Suspense>
        <Header sectionColor={SECTIONS.hero.bg} categories={categories} />
      </Suspense>
      <Hero />
      <MemoriesSection />
      <Suspense>
        <HomeCatalog products={products} categories={categories} />
      </Suspense>
      <About />
      <Contact />
      <Footer />
    </main>
  );
}
