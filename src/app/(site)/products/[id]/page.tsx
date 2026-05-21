import type { Metadata } from 'next';
import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductDetailsClient from '@/components/ProductDetailsClient';
import { getSiteContactChannels } from '@/lib/contact.server';
import { absoluteOgImageUrl, siteUrlNormalized, truncateDescription } from '@/lib/seoHelpers';
import { getCategoriesForNav, getProductById, getRelatedProducts } from '@/lib/products.server';
import { SECTIONS } from '@/utils/theme';

export const revalidate = 60;

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

  const [product, categories, channels] = await Promise.all([
    getProductById(productId),
    getCategoriesForNav(),
    getSiteContactChannels(),
  ]);

  if (!product) {
    notFound();
  }

  const relatedProducts =
    product.categoryId > 0
      ? await getRelatedProducts(product.id, product.categoryId)
      : [];

  const catalogBg = SECTIONS.catalog.bg;

  return (
    <main>
      <Suspense>
        <Header
          sectionColor={catalogBg}
          categories={categories}
          currentProduct={{
            category: product.category,
            categorySlug: product.categorySlug,
            name: product.name,
          }}
        />
      </Suspense>
      <ProductDetailsClient
        product={product}
        relatedProducts={relatedProducts}
        phoneHref={channels.phoneHref}
        emailHref={channels.emailHref}
      />
      <Footer />
    </main>
  );
}
