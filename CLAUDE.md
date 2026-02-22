# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

EasyPostV2 is an AI-powered social media management platform for African creators. It is a monorepo with three active services:

- `Nestjs_Backend/` — Primary REST API (NestJS v11)
- `frontend-next/` — Web app (Next.js App Router)
- `ml_service/` — AI scheduling predictions (FastAPI / Python 3.13)

> `backend/` and `frontend/` are **deprecated** — do not modify them.

## Package Manager

**pnpm is mandatory** for both `Nestjs_Backend/` and `frontend-next/`. Do not use npm or yarn to install dependencies.

---

## Backend (`Nestjs_Backend/`)

### Commands
```bash
pnpm install
pnpm run start:dev          # Dev server with watch (port 3000)
pnpm run build              # Compile TypeScript
pnpm run start:prod         # Run compiled output
pnpm run lint               # ESLint with auto-fix
pnpm run test               # Unit tests (Jest, spec files in src/)
pnpm run test:watch         # Watch mode
pnpm run test:cov           # Coverage report
pnpm run test:e2e           # E2E tests (test/jest-e2e.json)
pnpm run test -- --testPathPattern=src/modules/posts  # Run single module's tests
```

### Prisma
```bash
pnpm prisma generate        # Regenerate client after schema changes
pnpm prisma migrate dev     # Apply migrations locally
pnpm prisma db seed         # Seed via tsx prisma/seed.ts
```

The schema is at `Nestjs_Backend/prisma/schema.prisma`. Uses two connection strings: `DATABASE_URL` (pooled, Prisma) and `DIRECT_URL` (direct, migrations).

### Infrastructure dependencies
- **PostgreSQL** — Neon (serverless) in production; `docker-compose.yml` spins up a local Postgres + Adminer on ports 5432 / 8080
- **Redis** — Required for BullMQ job queues (env vars: `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD`, `REDIS_TLS`)

### Architecture patterns

**Module structure** — Every feature is a self-contained NestJS module under `src/modules/<feature>/` with a controller, service, DTOs, and optional guards/strategies. All modules register in `src/app.module.ts`.

**Post publishing pipeline:**
1. `PostsService.create()` — creates the post record and emits `post_created` via WebSocket
2. `SchedulerService` — `@Cron` job polls for `SCHEDULED` posts and hands them to `PublisherService`
3. `PublisherService` — iterates `PostSocialAccount` records and calls the appropriate platform API (Facebook, LinkedIn, Twitter, TikTok, Instagram); retries up to 2 times per account

**Real-time events** — `AppEventsGateway` (Socket.IO, namespace `/events`) broadcasts workspace-scoped events. Clients send `join_workspace` to subscribe; the backend calls `sendToWorkspace(workspaceId, event, data)` from any service.

**AI service** — `AiService` uses Google Gemini (`gemini-1.5-flash`) as the primary model and Groq (via OpenAI-compatible client) as a fallback. Tones include African-specific options: `CAMFRANGLAIS`, `NOUCHI`, `PIDGIN`.

**Authentication** — JWT (access + refresh tokens stored in `sessions` table). Google OAuth via Passport. Admin role is assigned by hardcoded email allowlist in `AuthService`. Only `/admin` routes are protected at the middleware level in the frontend.

**Workspace scoping** — Almost every entity belongs to a `Workspace`. Guards (`workspace.guard.ts`, `permission.guard.ts`) extract `workspaceId` from request params and check membership/role before any service call.

---

## Frontend (`frontend-next/`)

### Commands
```bash
pnpm install
pnpm dev -- -p 3001         # Dev server on port 3001
pnpm build                  # Production build
pnpm lint                   # ESLint
pnpm test                   # Jest unit tests
pnpm test:watch             # Watch mode
# E2E (Playwright):
pnpm test:e2e:server        # Start app on port 3001 first, then run Playwright
```

Set `NEXT_PUBLIC_API_URL` in `.env.local` to `http://localhost:3000/api` for local dev.

### Architecture patterns

**Routing** — App Router. Key routes:
- `/` — Landing page
- `/dashboard/[id]` — Workspace dashboard (the main app shell)
- `/workspaces` — Workspace picker
- `/admin` — Admin panel (JWT-role-protected by Next.js middleware)
- `/auth/*`, `/login`, `/signup`, `/onboarding`

**API layer** — `src/lib/api.ts` is a thin fetch wrapper that reads `accessToken` from cookies, auto-redirects on 401, and handles FormData vs JSON transparently. All feature-specific calls live in `services/` (e.g. `postApi.ts`, `boardApi.ts`, `aiApi.ts`).

**Component structure** — Landing/marketing components sit in `src/components/`. Product UI lives in `src/components/easypost/` (e.g. `Composer.tsx`, `BoardView.tsx`, `DashboardUI.tsx`, `CalendarView.tsx`). Types shared across the app are in `src/components/easypost/types.ts`.

**State** — React Query (`@tanstack/react-query`) for server state. No global client state library.

**Real-time** — `socket.io-client` connects to the backend's `/events` namespace; the client joins a workspace room after login to receive live updates.

**Auth flow** — JWT stored in `accessToken` cookie. `middleware.ts` only enforces auth for `/admin` routes using `jose` (Edge Runtime compatible). All other route protection is handled client-side.

---

## ML Service (`ml_service/`)

### Commands
```bash
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Single endpoint: `POST /predict` — accepts historical post engagement data and returns top-3 time suggestions plus an optional weekly heatmap. The `RandomForestRegressor` is trained on-the-fly per request when `len(data) > 5`; otherwise falls back to hardcoded heuristics.

---

## Production URLs

| Service | URL |
|---------|-----|
| Frontend | https://easyposttio.vercel.app |
| Backend API | https://easypostv2.onrender.com |
| Swagger docs | https://easypostv2.onrender.com/api-docs |
