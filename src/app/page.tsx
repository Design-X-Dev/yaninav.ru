import { Suspense } from 'react';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import MemoriesSection from '@/components/MemoriesSection';
import HomeCatalog from '@/components/HomeCatalog';
import About from '@/components/About';
import Contact from '@/components/Contact';
import Footer from '@/components/Footer';
import { SECTIONS } from '@/utils/theme';

export default function Home() {
  return (
    <main>
      <Suspense>
        <Header sectionColor={SECTIONS.hero.bg} />
      </Suspense>
      <Hero />
      <MemoriesSection />
      <Suspense>
        <HomeCatalog />
      </Suspense>
      <About />
      <Contact />
      <Footer />
    </main>
  );
}
