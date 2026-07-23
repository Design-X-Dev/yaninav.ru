import type { NextConfig } from 'next';

import { withPayload } from '@payloadcms/next/withPayload';

const LONG_CACHE = 'public, max-age=31536000, immutable';
const longCacheHeaders = [
  {
    key: 'Cache-Control',
    value: LONG_CACHE,
  },
];

/** Иконки: короткий кэш для обновления favicon (Safari/B-04); не для HTML/API. */
const shortIconCacheHeaders = [
  {
    key: 'Cache-Control',
    value: 'public, max-age=86400, must-revalidate',
  },
];

const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  // Clickjacking for /admin and the rest of the site. Full CSP (script-src) deferred — breaks CMS scripts + Next inline.
  { key: 'Content-Security-Policy', value: "frame-ancestors 'self'" },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
];

const nextConfig: NextConfig = {
  output: 'standalone',
  // Отключить streaming metadata — метаданные всегда в <head> для всех агентов
  // Нужно для корректного отображения превью в соцсетях/мессенджерах (WhatsApp, Telegram, VK)
  htmlLimitedBots: /.*/,
  images: {
    formats: ['image/avif', 'image/webp'],
    // Next 16: quality must be allowlisted (ProductCard uses 80; default is 75)
    qualities: [75, 80],
    // Уменьшены breakpoints — картинки уже оптимизированы на дисе (sizes.card: 900x900)
    // Оптимизатор теперь меньше нагружает CPU в runtime
    deviceSizes: [640, 828, 1080, 1200, 1920],
    imageSizes: [32, 64, 128, 256, 640, 900],
  },
  async redirects() {
    return [
      {
        source: '/catalog',
        destination: '/collection',
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
      {
        source: '/_next/static/:path*',
        headers: longCacheHeaders,
      },
      {
        source: '/images/:path*',
        headers: longCacheHeaders,
      },
      {
        source: '/videos/:path*',
        headers: longCacheHeaders,
      },
      {
        source: '/api/image/file/:path*',
        headers: longCacheHeaders,
      },
      {
        source: '/api/video/file/:path*',
        headers: longCacheHeaders,
      },
      {
        source: '/icon.svg',
        headers: shortIconCacheHeaders,
      },
      {
        source: '/icon.png',
        headers: shortIconCacheHeaders,
      },
      {
        source: '/apple-icon.png',
        headers: shortIconCacheHeaders,
      },
      {
        source: '/favicon.ico',
        headers: shortIconCacheHeaders,
      },
    ];
  },
};

export default withPayload(nextConfig);
