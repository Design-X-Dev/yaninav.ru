import type { MetadataRoute } from 'next';
import { siteUrlNormalized } from '@/lib/seoHelpers';

/**
 * Публичная часть индексируется; /admin и REST /api закрыты.
 * Файлы медиа (/api/image/file/, /api/video/file/) явно allow —
 * иначе Google Images не индексирует картинки товаров (disallow /api перекрывает).
 */
export default function robots(): MetadataRoute.Robots {
  const base = siteUrlNormalized();

  return {
    rules: {
      userAgent: '*',
      allow: ['/', '/api/image/file/', '/api/video/file/'],
      disallow: ['/admin', '/api'],
    },
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
