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

const nextConfig: NextConfig = {
  output: 'standalone',
  // Отключить streaming metadata — метаданные всегда в <head> для всех агентов
  // Нужно для корректного отображения превью в соцсетях/мессенджерах (WhatsApp, Telegram, VK)
  htmlLimitedBots: /.*/,
  images: {
    formats: ['image/avif', 'image/webp'],
    // Уменьшены breakpoints — картинки уже оптимизированы на дисе (sizes.card: 900x900)
    // Оптимизатор теперь меньше нагружает CPU в runtime
    deviceSizes: [640, 828, 1080, 1200, 1920],
    imageSizes: [32, 64, 128, 256, 640, 900],
    // Качество JPEG 80% вместо дефолта 75% — баланс между размером и качеством
    quality: 80,
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
