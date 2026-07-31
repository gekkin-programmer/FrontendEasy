# syntax=docker/dockerfile:1
# ──────────────────────────────────────────────────────
# Next.js 15 standalone build (next.config.ts: output "standalone")
# pnpm version is pinned by the "packageManager" field via corepack.
# ──────────────────────────────────────────────────────

# ── Stage 1: install dependencies ─────────────────────
FROM node:20-alpine AS deps
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# ── Stage 2: build ─────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app
RUN corepack enable
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ARG NODE_OPTIONS=--max-old-space-size=4096
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_APP_URL
ARG NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN
ARG NEXT_PUBLIC_POSTHOG_HOST
ARG NEXT_PUBLIC_GOOGLE_PICKER_API_KEY
ARG NEXT_PUBLIC_GOOGLE_DRIVE_CLIENT_ID
ARG NEXT_PUBLIC_META_APP_ID
ARG NEXT_PUBLIC_META_ES_CONFIG_ID
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL
ENV NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN=$NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN
ENV NEXT_PUBLIC_POSTHOG_HOST=$NEXT_PUBLIC_POSTHOG_HOST
ENV NEXT_PUBLIC_GOOGLE_PICKER_API_KEY=$NEXT_PUBLIC_GOOGLE_PICKER_API_KEY
ENV NEXT_PUBLIC_GOOGLE_DRIVE_CLIENT_ID=$NEXT_PUBLIC_GOOGLE_DRIVE_CLIENT_ID
ENV NEXT_PUBLIC_META_APP_ID=$NEXT_PUBLIC_META_APP_ID
ENV NEXT_PUBLIC_META_ES_CONFIG_ID=$NEXT_PUBLIC_META_ES_CONFIG_ID
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm build

# ── Stage 3: minimal runtime ───────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0

# Run as a non-root user
RUN addgroup -S -g 1001 nodejs && adduser -S -u 1001 -G nodejs nextjs

# Standalone output contains the server + a pruned node_modules
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
