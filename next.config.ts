import type { NextConfig } from 'next';

import { withPayload } from '@payloadcms/next/withPayload';

const LONG_CACHE = 'public, max-age=31536000, immutable';
const longCacheHeaders = [
  {
    key: 'Cache-Control',
    value: LONG_CACHE,
  },
];

/** Safari и обновления: не «запечатывать» PNG/SVG favicon навсегда (см. B-04). Порядок важен — дубликаты Cache-Control переопределяются последним правилом. */
const shortIconCacheHeaders = [
  {
    key: 'Cache-Control',
    value: 'public, max-age=86400, must-revalidate',
  },
];

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    unoptimized: true,
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
        headers: longCacheHeaders,
      },
      {
        source: '/_next/static/:path*',
        headers: longCacheHeaders,
      },
      {
        source: '/videos/:path*',
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
