'use client';

import { useState, useEffect, Suspense } from 'react';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import MemoriesSection from '@/components/MemoriesSection';
import Catalog from '@/components/Catalog';
import About from '@/components/About';
import Contact from '@/components/Contact';
import Footer from '@/components/Footer';
import { SECTIONS } from '@/utils/theme';

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

function HomeContent() {
  const catalogLimit = useResponsiveCatalogLimit();
  useHashScroll();

  return (
    <main>
      <Header sectionColor={SECTIONS.hero.bg} />
      <Hero />
      <MemoriesSection />
      <Catalog limit={catalogLimit} showViewAll hideCategoryFilter />
      <About />
      <Contact />
      <Footer />
    </main>
  );
}

export default function Home() {
  return (
    <Suspense>
      <HomeContent />
    </Suspense>
  );
}
