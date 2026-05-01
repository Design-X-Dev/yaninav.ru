import type { NextConfig } from 'next';

import { withPayload } from '@payloadcms/next/withPayload';

const LONG_CACHE = 'public, max-age=31536000, immutable';
const longCacheHeaders = [
  {
    key: 'Cache-Control',
    value: LONG_CACHE,
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
        source: '/images/:path*',
        headers: longCacheHeaders,
      },
      {
        source: '/videos/:path*',
        headers: longCacheHeaders,
      },
      {
        source: '/favicon.ico',
        headers: longCacheHeaders,
      },
    ];
  },
};

export default withPayload(nextConfig);
