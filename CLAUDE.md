# EasyPostV2 — Claude Code Reference

AI-powered social media management SaaS for African creators (Cameroon, Nigeria, Ivory Coast).

---

## Architecture

```
User → Nginx (80/443)
         ├── /api/*        → NestJS Backend  (port 3000)
         ├── /socket.io/*  → NestJS Backend  (WebSocket)
         ├── /api-docs     → NestJS Backend  (Swagger)
         └── /*            → Next.js Frontend (port 3000)

NestJS Backend
  ├── PostgreSQL (Neon serverless) via Prisma ORM
  ├── Redis (BullMQ job queues)
  ├── ML Service via HTTP (smart scheduling)
  └── External: OpenAI/Groq, Cloudinary, Resend, PawaPay, Social APIs
```

### Production URLs
| Service | URL | Host |
|---------|-----|------|
| Frontend | https://easyposttio.vercel.app | Vercel |
| Backend API | https://easypostv2.onrender.com | Render |
| Swagger | https://easypostv2.onrender.com/api-docs | Render |
| Database | Neon PostgreSQL (serverless) | Neon.tech |

---

## Package Manager

**pnpm is mandatory across all services.** Never use npm or yarn.

---

## frontend-next/

Next.js 16 + React 19 + TypeScript. Neubrutalist design for African markets.

### Dev Commands
```bash
cd frontend-next
pnpm install
pnpm dev -- -p 3001          # Dev server on port 3001
pnpm build                   # Production build
pnpm test                    # Jest unit tests
pnpm test:watch              # Jest watch mode
pnpm test:e2e:server         # Playwright e2e (port 3001)
pnpm lint                    # ESLint
pnpm verify                  # lint + test + build (full CI check)
```

### Tech Stack
- **Framework**: Next.js 16, App Router, React 19
- **Styling**: Tailwind CSS v3, Shadcn/Radix UI components
- **State**: TanStack React Query v5 (staleTime: 60s, retry: 1)
- **Realtime**: Socket.IO client v4
- **HTTP**: Axios via centralized `src/lib/api.ts`
- **Auth**: JWT in `accessToken` cookie + OAuth (Google)
- **i18n**: Context-based en/fr (no i18next library)
- **Animations**: Framer Motion v12
- **Icons**: Lucide React, React Icons
- **Toasts**: Sonner
- **Drag & Drop**: dnd-kit
- **Charts**: Recharts
- **Monitoring**: Sentry

### Key Files
| File | Purpose |
|------|---------|
| `src/lib/api.ts` | **Always use this** — Axios wrapper with token injection, 401 redirect |
| `src/context/LanguageContext.tsx` | i18n + theme (en/fr, light/dark) |
| `src/context/SocketContext.tsx` | WebSocket provider |
| `src/providers/query-provider.tsx` | TanStack React Query setup |
| `src/components/easypost/types.ts` | ChannelType, Post, PostStatus types |
| `src/app/layout.tsx` | Root layout with all providers |
| `src/dashboard/layout.tsx` | Dashboard layout (Sidebar + MobileNav) |

### Routes
**Public:** `/`, `/about`, `/help`, `/pricing`, `/community`, `/creator-fund`, `/checkout`, `/legal/*`, `/login`, `/signup`, `/auth/callback`

**Protected:** `/dashboard`, `/dashboard/[id]`, `/dashboard/[id]/settings`, `/dashboard/analytics`, `/dashboard/projects`, `/dashboard/settings`, `/onboarding`, `/workspaces`

**Admin:** `/admin`, `/admin/users`, `/admin/feedback`, `/admin/grants`

### Design Conventions
- **Font**: JetBrains Mono (entire app via Tailwind)
- **Brand color**: `#3C48F5`
- **Light bg**: `#F4F4F0` | **Dark bg**: `#000000`
- **Neubrutalism**: 2–4px solid borders + hard shadows `shadow-[4px_4px_0px_0px_#000]`
- **Dark mode**: Tailwind `dark:` class-based toggle
- **Mobile-first**: Bottom nav on mobile, sidebar on desktop

### i18n Pattern
```tsx
import { useLanguage } from '@/context/LanguageContext';
const { t, language, toggleLanguage, theme, toggleTheme } = useLanguage();
// Usage:
t("Publish now", "Publier maintenant")
```

### API Client Pattern
```tsx
import api from '@/lib/api';
// Always use api.get/post/patch/delete — never raw fetch/axios
const data = await api.get<WorkspaceType[]>('/workspaces');
const result = await api.post('/posts', { content, scheduledFor });
const uploaded = await api.upload('/media', formData);
```

### Environment Variables
```env
NEXT_PUBLIC_API_URL=http://localhost:3000    # Backend URL (no /api suffix)
NEXT_PUBLIC_APP_URL=http://localhost:3001
NEXT_PUBLIC_API_VERSION=v1
```

---

## Nestjs_Backend/

NestJS 11 + TypeScript + Prisma + PostgreSQL. 33 modules, REST API + WebSocket.

### Dev Commands
```bash
cd Nestjs_Backend
cp .env.example .env              # Fill in DATABASE_URL and JWT_SECRET
pnpm install
pnpm prisma generate              # Generate Prisma client
pnpm prisma migrate dev           # Run migrations
pnpm run start:dev                # Dev server with hot reload (port 3000)
pnpm run build                    # Production build
pnpm run start:prod               # Start production build
pnpm test                         # Jest unit tests
pnpm test:cov                     # Test coverage
pnpm run seed                     # Seed database
pnpm run db:cleanup               # Clean database
pnpm run lint                     # ESLint with auto-fix
```

### Tech Stack
- **Framework**: NestJS 11, Express 5, TypeScript
- **ORM**: Prisma 6 + Neon PostgreSQL
- **Auth**: JWT (7d) + Refresh tokens (30d) + OAuth (Google, Facebook, LinkedIn, Twitter, TikTok, YouTube, WhatsApp)
- **Queue**: BullMQ 5 + Redis
- **Realtime**: Socket.IO via `AppEventsGateway` (`/events` namespace)
- **AI**: LangChain + OpenAI/Groq (Llama-3-70B)
- **Storage**: Cloudinary
- **Email**: Resend API + Nodemailer fallback
- **SMS**: Twilio
- **Payments**: PawaPay (Orange Money, MTN MoMo, Wave)
- **Monitoring**: Sentry + Pino logging
- **Docs**: Swagger at `/api-docs`

### Module Structure (33 modules)
```
Auth, Users, Workspaces, Members, Teams
Posts, Media, Comments, Labels, Tags, ContentCalendar
AI, SmartScheduling, Assistant (EasyAI)
SocialAccounts, Engagement, Streams, Analytics, Community
Boards (Kanban), Campaigns, Payments, CreatorFund
Activity, Admin, Notifications, AppEvents (WebSocket), Logger, Subscriptions
Cloudinary, Email, LangChain, Chat
```

### Key Conventions
- All routes prefixed with `/api`
- Guard order: `JwtAuthGuard` → `RolesGuard` → `SubscriptionGuard`
- Use `@CurrentUser()` decorator to get the authenticated user
- Use `@Public()` to skip auth on public endpoints
- Inject `PrismaService` for all database access
- Use `class-validator` decorators on all DTOs
- `AppEventsGateway` for WebSocket broadcasts to workspaces/users

### Auth Guard Pattern
```typescript
@UseGuards(JwtAuthGuard)              // Require authentication
@UseGuards(JwtAuthGuard, RolesGuard)  // Require role
@Roles('ADMIN')
@Public()                             // No auth required
```

### WebSocket Broadcast Pattern
```typescript
constructor(private readonly appEvents: AppEventsGateway) {}
this.appEvents.sendToWorkspace(workspaceId, 'post_published', { post });
this.appEvents.sendToUser(userId, 'notification', { message });
```

### BullMQ Job Pattern
```typescript
// Add job
await this.queue.add('sync-account', { accountId }, { attempts: 3 });
// Process job (in processor class)
@Process('sync-account')
async handle(job: Job<{ accountId: string }>) { ... }
```

### Key Files
| File | Purpose |
|------|---------|
| `prisma/schema.prisma` | All 45+ database models |
| `src/main.ts` | Bootstrap: Helmet, CORS, Validation pipe, Swagger |
| `src/app.module.ts` | Root module — register new modules here |
| `src/prisma/prisma.service.ts` | Database client |
| `src/common/guards/` | JwtAuth, Roles, Subscription, Workspace, WsJwt guards |
| `src/common/decorators/` | @CurrentUser, @Public, @Roles, @Permissions |
| `.env.example` | All required environment variables |

### Environment Variables (key ones)
```env
DATABASE_URL=postgresql://...          # Neon DB connection string
JWT_SECRET=
JWT_EXPIRATION=7d
REFRESH_TOKEN_SECRET=
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
OPENAI_API_KEY=sk-...
GROQ_API_KEY=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
RESEND_API_KEY=
FRONTEND_URL=http://localhost:3001
CORS_ORIGINS=http://localhost:3000,http://localhost:3001
```

### Subscription Plans
`FREE` → `STARTER` → `PROFESSIONAL` → `BUSINESS` → `ENTERPRISE`

Use `@UseGuards(SubscriptionGuard)` + `@RequiresPlan('STARTER')` to gate features.

---

## ml_service/

FastAPI microservice for AI smart scheduling. Prototype stage — single file, not yet in docker-compose.

### Dev Commands
```bash
cd ml_service
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000 --reload   # Dev with reload
python main.py                                           # Direct run
```

### Tech Stack
- **Language**: Python 3.13.3
- **Framework**: FastAPI + Uvicorn
- **ML**: scikit-learn (RandomForestRegressor), pandas, numpy, xgboost

### Endpoint
```
POST /predict
```
**Request:**
```json
{
  "workspace_id": "string",
  "platform": "instagram",
  "historical_data": [
    { "publish_time": "2024-01-15T09:00:00", "platform": "instagram", "engagement": 142, "media_type": "image" }
  ]
}
```
**Response:** Top 3 suggested posting hours ranked by predicted engagement score.
```json
{
  "suggestions": [
    { "hour": 9, "score": 0.92, "confidence": "high" },
    { "hour": 19, "score": 0.87, "confidence": "high" },
    { "hour": 13, "score": 0.71, "confidence": "medium" }
  ]
}
```

**Logic:**
- Encodes timestamps as cyclical features (sin/cos for hour + day of week)
- Trains RandomForestRegressor on the fly (prototype — no persistence)
- Falls back to hardcoded times (9am, 1pm, 7pm) if < 6 samples
- Confidence = "high" if > 20 samples, else "medium"

### Key File
- `ml_service/main.py` — entire service (Pydantic models, feature engineering, model training, inference)

---

## Infrastructure

### Docker Compose (root `docker-compose.yml`)
```bash
# Root .env only needs:
DOMAIN_URL=https://yourdomain.com
REDIS_PASSWORD=your_redis_password

# Backend env is read from Nestjs_Backend/.env

# Start all services
docker compose up -d

# View logs
docker compose logs -f backend
```

Services: `redis` → `backend` → `frontend` → `nginx`

> **Note**: ML service is NOT in docker-compose yet (manual deployment only)

### Nginx
- HTTP → HTTPS redirect
- `/api/*` → backend (120s timeout)
- `/socket.io/*` → backend (WebSocket, 24h timeout)
- `/api-docs` → backend (Swagger)
- `/*` → frontend
- Max upload: 50MB

**SSL setup sequence:**
1. Start nginx with `nginx.init-ssl.conf` (HTTP only)
2. Run Certbot to obtain certificates
3. Swap to `nginx.conf` (full HTTPS) and restart

### CI/CD (.github/workflows/ci.yml)
Triggers on push/PR to `main`:
- **Backend**: pnpm install → prisma generate → test → build
- **Frontend**: pnpm install → build

---

## Custom Slash Commands

| Command | Description |
|---------|-------------|
| `/nest-module <name>` | Scaffold complete NestJS module (module + controller + service + DTO + spec) |
| `/new-component <name>` | Create React component with neubrutalist design + i18n |
| `/new-page <route>` | Create Next.js App Router page (public or protected) |
| `/add-platform <name>` | Guide for adding a new social media platform (backend + frontend) |
| `/translate <path>` | Replace hardcoded strings with `t("EN", "FR")` i18n calls |
| `/db-migrate <desc>` | Prisma schema change + migration workflow |
| `/ml-endpoint <name>` | Add new FastAPI endpoint to ml_service |

---

## Common Gotchas

- **pnpm only** — never `npm install` or `yarn`
- **Frontend runs on port 3001** in dev (`pnpm dev -- -p 3001`), not 3000
- **Never use raw fetch/axios** in frontend — always use `src/lib/api.ts`
- **Prisma client** must be regenerated after schema changes: `pnpm prisma generate`
- **New NestJS modules** must be registered in `src/app.module.ts`
- **Socket.IO** WebSocket connects to `/events` namespace — join workspace with `join_workspace` event
- **ML service** is a prototype — no auth, no docker, no model persistence yet
- **i18n** is context-based (no i18next) — use `t("EN", "FR")` helper from `useLanguage()`
- **Dark mode** is class-based via `LanguageContext` — use `dark:` Tailwind variants
