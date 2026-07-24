# Сборка
FROM node:20-bookworm-slim AS builder

RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 make g++ libvips-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json package-lock.json* ./
COPY patches ./patches
RUN npm ci

COPY . .
RUN mkdir -p data
ENV DATABASE_URI=file:./data/payload.db
ENV PAYLOAD_SECRET=docker-build-placeholder-secret
# NEXT_PUBLIC_* is inlined into the client bundle at build time — not overridable at runtime.
ARG NEXT_PUBLIC_SITE_URL=https://yaninav.ru
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
ENV ADMIN_EMAIL=build@local.dev
ENV ADMIN_PASSWORD=buildlocalpass
RUN npm run payload:migrate
RUN npm run build

# Продакшен
FROM node:20-bookworm-slim AS runner

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends libvips42 \
    && rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN groupadd --system --gid 1001 nodejs \
    && useradd --system --uid 1001 --gid nodejs nextjs

RUN mkdir -p /app/data/image /app/data/video && chown -R nextjs:nodejs /app/data

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder /app/package.json ./package.json

COPY --from=builder --chown=nextjs:nodejs /app/scripts/remove-dev-push-marker.mjs ./scripts/remove-dev-push-marker.mjs

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["sh","-c","node scripts/remove-dev-push-marker.mjs && node server.js"]
