# EasyPostV2 (EazyPost) — Claude Reference

AI-powered social media SaaS for African creators.
**IMPORTANT:** 95% confidence required before changes. Ask questions first.

## 1. Essential Workflow
- **Package Manager:** `pnpm` is mandatory. Never use npm/yarn.
- **Git Strategy:** Worktree-based sync from Monorepo to `FrontendEasy` and `BackendEasy` repos.
- **Ports:** Frontend (3001), Backend (3000), ML (8000).
- **CI/CD:** Push to `dev` branch -> GitHub Actions (lint/test/build) -> Auto-promote to `main` -> Dokploy.

## 2. Project Layout & Pointers
Detailed specs are in `.claude/memory/`.

- **Frontend (`frontend-next/`):** Next.js 16, React 19, Neubrutalism. 
  - *Ref:* See `.claude/memory/frontend.md` for Routes & Design Patterns.
- **Backend (`Nestjs_Backend/`):** NestJS 11, Prisma 6, PostgreSQL (Neon).
  - *Ref:* See `.claude/memory/backend.md` for Module list & Auth Guards.
- **ML Service (`ml_service/`):** FastAPI smart scheduling.
  - *Ref:* See `.claude/memory/ml-service.md`.
- **Infrastructure:** Docker Compose, Nginx, Dokploy.
  - *Ref:* See `.claude/memory/architecture.md`.

## 3. Critical Coding Standards
- **API Calls:** Always use `src/lib/api.ts` Axios wrapper. No raw fetch.
- **Database:** `pnpm prisma generate` after schema changes. Inject `PrismaService`.
- **i18n:** Use `t("EN", "FR")` from `useLanguage()` context.
- **WebSockets:** Use `AppEventsGateway` via `/events` namespace.
- **Styling:** Tailwind `dark:` variants + JetBrains Mono + 2-4px solid borders.

## 4. Commands
- **Frontend Dev:** `pnpm dev -- -p 3001`
- **Backend Dev:** `pnpm run start:dev`
- **Tests:** `pnpm test` (Excludes e2e). See `.claude/memory/testing.md` for Mocking rules.
- **Sync:** Use `git worktree add /tmp/be-worktree backend-easy/dev`.

## 5. Custom Slash  Commands
| Command | Action |
|---------|--------|
| `/nest-module` | Scaffold full NestJS module |
| `/new-component`| Create Neubrutalist React component |
| `/translate` | Convert strings to i18n helper |
| `/db-migrate` | Prisma schema change workflow |

## 6. Memory Maintenance & Auto-Compact Protocol
**Trigger:** If context usage reaches **60% (120k tokens)**, or upon milestone completion:
1. **Critical Sync:** Update `.claude/memory/*.md` with all architectural changes, new API routes, or design patterns established in this session.
2. **State Snapshot:** Update `.claude/memory/active_sprint.md` with:
   - **Status:** What was just completed.
   - **Blockers:** Unresolved bugs or technical debt.
   - **Next Step:** The immediate next task for the following session.
3. **Token Reset:** Explicitly prompt the user: "Memory synced to .md files. Usage is at [X]%. Ready for `/clear` to reset the buffer."
