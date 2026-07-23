# Performance Optimization Guide

## Image Loading Optimization

### ✅ Changes Made (2026-06-04)

1. **Lazy Loading of Additional Product Images**
   - Only first image loads on page load
   - Additional images (image2, image3) load on hover or click
   - Reduces initial HTTP requests by ~60-70% on catalog page
   - File: `src/components/ProductCard.tsx`

2. **Image Optimization Configuration**
   - Reduced device breakpoints (fewer JPEG variants generated)
   - Quality set to 80% (vs default 75%) for better visual quality
   - File: `next.config.ts`

3. **Cache Persistence Between Deployments**
   - `.next/cache` volume mounted in Docker to preserve optimized images
   - Eliminates re-optimization of entire image set on each deploy
   - File: `docker-compose.prod.yml`

4. **Increased Container Resources**
   - CPU: 0.90 → 2.0 cores
   - Memory: 1GB → 2GB
   - Enables faster image optimization and SSR rendering
   - File: `docker-compose.prod.yml`

### 📊 Expected Improvements

- **Catalog page load**: ~2-3x faster (fewer images in initial HTML)
- **Time to Interactive (TTI)**: ~1-2s reduction
- **Cache hit rate**: 90%+ on production (persisted `.next/cache`)
- **TTFB**: Minimal impact (metadata still blocking, as per `htmlLimitedBots`)

### 🚀 Deployment Steps

```bash
# Build and deploy with new config
docker compose -f docker-compose.prod.yml up --build

# First deployment will generate cache (slower, ~2-5 min for all images)
# Subsequent deployments reuse cache (much faster)
```

### ⚠️ Important Notes

- **First Deploy**: Slower (cache is empty) — give it 5-10 minutes
- **Subsequent Deploys**: Fast (cache hits 90%+)
- **Cache Directory**: `.next-cache/` — monitor disk usage if building many times
- **Memory**: Ensure host has at least 2GB free when deploying

## Streaming Metadata Disabled

**Why**: Social media crawlers (Telegram, WhatsApp, VK) expect metadata in initial HTML, not in JavaScript streams.

**Config**: `next.config.ts` → `htmlLimitedBots: /.*/`

**Effect**: All metadata always in `<head>` (slight SSR delay, but ensures social previews work).

## Future Optimizations

- Static generation of `/collection` page (remove dynamic category filtering from server)
- WebP preloading for first 3 visible cards
- Image CDN for serving pre-optimized variants
