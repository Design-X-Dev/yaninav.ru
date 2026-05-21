import type { Metadata } from 'next';
import { Suspense } from 'react';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import MemoriesSection from '@/components/MemoriesSection';
import HomeCatalog from '@/components/HomeCatalog';
import About from '@/components/About';
import Contact from '@/components/Contact';
import Footer from '@/components/Footer';
import { SECTIONS } from '@/utils/theme';
import { getAboutContent } from '@/lib/about.server';
import { getHeroContent } from '@/lib/hero.server';
import { getMemoriesContent } from '@/lib/memories.server';
import {
  HOMEPAGE_DEFAULT_DESCRIPTION,
  HOMEPAGE_DEFAULT_OG_DESCRIPTION,
  HOMEPAGE_DEFAULT_OG_TITLE,
  HOMEPAGE_DEFAULT_TITLE,
} from '@/lib/homepageMeta.defaults';
import { getHomepageMeta } from '@/lib/homepage-seo.server';
import { absoluteOgImageUrl, siteUrlNormalized, truncateDescription } from '@/lib/seoHelpers';
import { getHomepageCatalogProducts } from '@/lib/homeCatalog.server';
import { getCategoriesForNav } from '@/lib/products.server';

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const base = siteUrlNormalized();
  const cms = await getHomepageMeta();

  const title = cms?.title?.trim() || HOMEPAGE_DEFAULT_TITLE;
  const description = truncateDescription(
    cms?.description?.trim() || HOMEPAGE_DEFAULT_DESCRIPTION,
  );

  const ogTitle = cms?.title?.trim() ? cms.title.trim() : HOMEPAGE_DEFAULT_OG_TITLE;
  const ogDescription = cms?.description?.trim()
    ? truncateDescription(cms.description.trim())
    : HOMEPAGE_DEFAULT_OG_DESCRIPTION;

  const ogPath = cms?.image?.trim();
  const ogUrl = ogPath ? absoluteOgImageUrl(ogPath, base) : undefined;

  return {
    title,
    description,
    alternates: { canonical: base },
    openGraph: {
      title: ogTitle,
      description: ogDescription,
      type: 'website',
      locale: 'ru_RU',
      ...(ogUrl ? { images: [{ url: ogUrl }] } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: ogTitle,
      description: ogDescription,
      ...(ogUrl ? { images: [ogUrl] } : {}),
    },
  };
}

export default async function Home() {
  const [homeCatalog, categories, memories, hero, about] = await Promise.all([
    getHomepageCatalogProducts(),
    getCategoriesForNav(),
    getMemoriesContent(),
    getHeroContent(),
    getAboutContent(),
  ]);

  return (
    <main>
      <Suspense>
        <Header sectionColor={SECTIONS.hero.bg} categories={categories} />
      </Suspense>
      {hero ? <Hero hero={hero} /> : null}
      {memories.slides.length >= 5 ? <MemoriesSection memories={memories} /> : null}
      {homeCatalog.enabled ? (
        <Suspense>
          <HomeCatalog products={homeCatalog.products} categories={categories} />
        </Suspense>
      ) : null}
      {about ? <About about={about} /> : null}
      <Contact />
      <Footer />
    </main>
  );
}
