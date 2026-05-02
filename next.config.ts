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
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [320, 640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 64, 96, 128, 256, 384, 640, 900],
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
        source: '/api/media-video/file/:path*',
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
