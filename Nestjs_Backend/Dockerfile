# ── Stage 1: Install dependencies ─────────────────────────────────────────────
FROM node:20-alpine AS deps

WORKDIR /app

# Install OpenSSL for Prisma
RUN apk add --no-cache openssl

COPY package.json package-lock.json* yarn.lock* pnpm-lock.yaml* ./
COPY prisma ./prisma/

# Install all dependencies (including devDependencies for build)
RUN \
  if [ -f pnpm-lock.yaml ]; then \
    corepack enable pnpm && pnpm install --frozen-lockfile; \
  elif [ -f yarn.lock ]; then \
    yarn install --frozen-lockfile; \
  elif [ -f package-lock.json ]; then \
    npm ci; \
  else \
    npm install; \
  fi

# Generate Prisma Client (with dummy env vars since live vars aren't available in Docker build context)
RUN DATABASE_URL="postgresql://dummy:password@localhost/db" DIRECT_URL="postgresql://dummy:password@localhost/db" npx prisma generate

# ── Stage 2: Build ────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

RUN apk add --no-cache openssl

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Allow CI to pass more heap via --build-arg NODE_OPTIONS (default: 2 GB)
ARG NODE_OPTIONS=--max-old-space-size=2048
ENV NODE_OPTIONS=${NODE_OPTIONS}

# Build the NestJS application
RUN corepack enable pnpm && pnpm run build

# ── Stage 3: Production ──────────────────────────────────────────────────────
FROM node:20-alpine AS runner

WORKDIR /app

RUN apk add --no-cache openssl

ENV NODE_ENV=production

# Create non-root user
RUN addgroup --system --gid 1001 nestjs && \
    adduser --system --uid 1001 nestjs

# Copy built application
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma

# Own the app directory
RUN chown -R nestjs:nestjs /app

USER nestjs

EXPOSE 3000

# Run Prisma migrations then start the app
CMD ["sh", "-c", "DIRECT_URL=${DIRECT_URL:-${DATABASE_URL}} npx prisma migrate deploy && node dist/main"]
