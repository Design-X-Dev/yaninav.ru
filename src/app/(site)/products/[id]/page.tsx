import type { Metadata } from 'next';
import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductDetailsClient from '@/components/ProductDetailsClient';
import { absoluteOgImageUrl, siteUrlNormalized, truncateDescription } from '@/lib/seoHelpers';
import { getAllProducts, getProductById, getCategoriesForNav } from '@/lib/products.server';
import { SECTIONS } from '@/utils/theme';

export const dynamic = 'force-dynamic';

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { id } = await params;
  const productId = Number.parseInt(id, 10);
  if (!Number.isFinite(productId)) return {};

  const product = await getProductById(productId);
  if (!product) return {};

  const base = siteUrlNormalized();
  const title = product.meta?.title?.trim() || `${product.name} — ЯНИНА В`;
  const description = truncateDescription(
    product.meta?.description?.trim() || product.description.replace(/\s+/g, ' ')
  );

  const ogPath = product.meta?.image?.trim() || product.image.trim();
  const ogUrl = ogPath ? absoluteOgImageUrl(ogPath, base) : undefined;

  return {
    title,
    description,
    alternates: { canonical: `${base}/products/${product.id}` },
    openGraph: {
      title,
      description,
      type: 'website',
      locale: 'ru_RU',
      ...(ogUrl ? { images: [{ url: ogUrl }] } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      ...(ogUrl ? { images: [ogUrl] } : {}),
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  const productId = Number.parseInt(id, 10);

  if (!Number.isFinite(productId)) {
    notFound();
  }

  const [product, categories, allProducts] = await Promise.all([
    getProductById(productId),
    getCategoriesForNav(),
    getAllProducts(),
  ]);

  if (!product) {
    notFound();
  }

  const relatedProducts = allProducts
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 3);

  const catalogBg = SECTIONS.catalog.bg;

  return (
    <main>
      <Suspense>
        <Header
          sectionColor={catalogBg}
          categories={categories}
          currentProduct={{ category: product.category, name: product.name }}
        />
      </Suspense>
      <ProductDetailsClient product={product} relatedProducts={relatedProducts} />
      <Footer />
    </main>
  );
}
