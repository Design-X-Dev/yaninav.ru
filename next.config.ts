import type { NextConfig } from "next";

const LONG_CACHE = 'public, max-age=31536000, immutable';
const longCacheHeaders = [
  {
    key: 'Cache-Control',
    value: LONG_CACHE,
  },
];

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    unoptimized: true,
  },
  async redirects() {
    return [
      {
        source: "/catalog",
        destination: "/collection",
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        // Агрессивно кешируем пререндеренные страницы и RSC-навигацию.
        source: '/:path*',
        headers: longCacheHeaders,
      },
      {
        // Статические файлы Next.js - кешируем навсегда
        source: '/_next/static/:path*',
        headers: longCacheHeaders,
      },
      {
        // Public media - подготовленные изображения и видео.
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

export default nextConfig;
