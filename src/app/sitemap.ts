import type { MetadataRoute } from 'next';
import { getAllCategories, getAllProducts } from '@/lib/products.server';
import { siteUrlNormalized } from '@/lib/seoHelpers';

/** Не пререндерить на билде — Local API обращается к SQLite (схема с plugin-seo). */
export const dynamic = 'force-dynamic';

/** Динамическая карта URL: статические страницы + каталог с фильтром + все товары. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrlNormalized();
  const [products, categories] = await Promise.all([getAllProducts(), getAllCategories()]);

  const now = new Date();
  const staticPaths = [
    '',
    '/collection',
    '/favorites',
    '/custom-orders',
    '/delivery',
    '/gift-certificate',
    '/offer',
    '/privacy',
    '/warranty',
  ];

  const categoryEntries = categories
    .filter((c) => c.id !== 'all')
    .map((c) => ({
      url: `${base}/collection?category=${encodeURIComponent(c.id)}`,
      lastModified: now,
    }));

  const productEntries = products.map((p) => ({
    url: `${base}/products/${p.id}`,
    lastModified: now,
  }));

  return [
    ...staticPaths.map((path) => ({ url: `${base}${path}`, lastModified: now })),
    ...categoryEntries,
    ...productEntries,
  ];
}
