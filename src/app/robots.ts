import type { MetadataRoute } from 'next';
import { siteUrlNormalized } from '@/lib/seoHelpers';

/** Разрешить индексацию публичной части, закрыть `/admin` и `/api`. */
export default function robots(): MetadataRoute.Robots {
  const base = siteUrlNormalized();

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/api'],
    },
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
