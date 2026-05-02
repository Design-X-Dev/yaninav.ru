# Сборка
FROM node:20-alpine AS builder

RUN apk add --no-cache libc6-compat python3 make g++ vips-dev

WORKDIR /app

COPY package.json package-lock.json* ./
COPY patches ./patches
RUN npm ci

COPY . .
RUN npm run build

# Продакшен
FROM node:20-alpine AS runner

WORKDIR /app

RUN apk add --no-cache vips

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

RUN mkdir -p /app/data/media && chown -R nextjs:nodejs /app/data

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
