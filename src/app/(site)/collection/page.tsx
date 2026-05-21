import type { Metadata } from 'next';
import { Suspense } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Catalog from '@/components/Catalog';
import { absoluteOgImageUrl, siteUrlNormalized, truncateDescription } from '@/lib/seoHelpers';
import { getAllProducts, getCategoriesForNav, getCategoryBySlug } from '@/lib/products.server';

export const revalidate = 60;

const defaultCatalogMeta = {
  title: 'Каталог — ЯНИНА В | Эксклюзивные украшения',
  description:
    'Каталог ювелирных изделий ручной работы: помолвочные и обручальные кольца, эксклюзивные украшения.',
};

interface CatalogPageProps {
  searchParams?: Promise<{ category?: string | string[] }>;
}

export async function generateMetadata({ searchParams }: CatalogPageProps): Promise<Metadata> {
  const base = siteUrlNormalized();
  const resolved = (await searchParams) ?? {};
  const rawCategory = resolved.category;
  const categoryParam =
    typeof rawCategory === 'string'
      ? rawCategory
      : Array.isArray(rawCategory)
        ? rawCategory[0]
        : undefined;

  let title = defaultCatalogMeta.title;
  let description = defaultCatalogMeta.description;
  let ogUrl: string | undefined;

  if (categoryParam) {
    const cat = await getCategoryBySlug(decodeURIComponent(categoryParam));
    if (cat) {
      title =
        cat.meta?.title?.trim() ||
        `${cat.name.trim()} — каталог | ЯНИНА В`;
      description = truncateDescription(
        cat.meta?.description?.trim() ||
          `${cat.name} — эксклюзивные ювелирные украшения ручной работы. Люксовый каталог ЯНИНА В.`,
      );

      const img = cat.meta?.image?.trim();
      ogUrl = img ? absoluteOgImageUrl(img, base) : undefined;
    }
  }

  const canonicalCategory = categoryParam
    ? `${base}/collection?category=${encodeURIComponent(categoryParam.toLowerCase())}`
    : `${base}/collection`;

  return {
    title,
    description,
    alternates: { canonical: canonicalCategory },
    openGraph: {
      title,
      description,
      type: 'website',
      locale: 'ru_RU',
      ...(ogUrl ? { images: [{ url: ogUrl }] } : {}),
    },
    twitter: {
      card: ogUrl ? 'summary_large_image' : 'summary',
      title,
      description,
      ...(ogUrl ? { images: [ogUrl] } : {}),
    },
  };
}

/** Категорию из URL читает `Catalog` на клиенте (`useSearchParams`). */
export default async function CatalogPage() {
  const [products, categories] = await Promise.all([
    getAllProducts(),
    getCategoriesForNav(),
  ]);

  return (
    <main>
      <Suspense>
        <Header categories={categories} />
      </Suspense>
      <Suspense>
        <Catalog products={products} categories={categories} hideCategoryFilter />
      </Suspense>
      <Footer />
    </main>
  );
}
