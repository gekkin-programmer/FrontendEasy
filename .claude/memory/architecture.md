# Infrastructure & Architecture Overview (EazyPost)
> **CRITICAL RULE**: NEVER push directly to the EasyPostV2 monorepo. All changes must be synced and pushed exclusively to the BackendEasy and FrontendEasy repositories via git worktrees.

## 1. System Architecture
The application follows a reverse-proxy pattern using Nginx to route traffic between the Next.js frontend and NestJS backend.

- **Nginx (Port 80/443):**
  - `/api/*` -> NestJS (3000)
  - `/socket.io/*` -> NestJS (WebSocket)
  - `/*` -> Next.js (3001)
- **Databases:**
  - PostgreSQL: Neon Serverless (Vector enabled).
  - Redis: BullMQ for job orchestration.
- **ML Service:** FastAPI (8000) for smart scheduling predictions.

## 2. Production Environment (Dokploy)
| Service | URL | Role |
| :--- | :--- | :--- |
| **Frontend** | `https://eazypost.cm` | Next.js App |
| **API** | `https://backend-eazypost.mbokofit.com` | NestJS REST + WS |
| **Swagger** | `.../api-docs` | API Documentation |
| **ML** | Internal Cluster | Scheduling Logic |

## 3. Git Worktree Workflow (Critical)
This monorepo (`EasyPostV2`) is the source of truth. Standalone repos (`FrontendEasy`, `BackendEasy`) are used for deployment via Dokploy.

### Remotes
- `origin`: `EasyPostV2` (Monorepo)
- `frontend-easy`: `FrontendEasy` (Standalone)
- `backend-easy`: `BackendEasy` (Standalone)

### Syncing to Standalone Repos
1. **Initialize Worktree:**
   `git worktree add /tmp/be-worktree backend-easy/dev`
2. **Sync Files:**
   Copy `src/`, `prisma/`, and `Dockerfile` into the worktree.
   *Note:* Do NOT overwrite the standalone `docker-compose.yml` with the monorepo version.
3. **Validate & Push:**
   Run `pnpm build` inside the worktree before pushing to the `dev` branch.

## 4. Deployment Pipeline
1. **Local Push:** Push to `dev` branch of the standalone repo.
2. **GitHub Actions:** Runs Lint -> Test -> Build.
3. **Auto-Promotion:** On success, `dev` is fast-forwarded to `main`.
4. **Dokploy:** Watches `main` and triggers a NixPacks or Docker build.

## 5. Docker Specifics
- **Backend Dockerfile:** 3-stage build (deps -> builder -> runner).
- **Auto-Migrations:** The runner stage executes `npx prisma migrate deploy` automatically before starting the server.
- **Networking:** In Dokploy/Compose, use service names (e.g., `REDIS_HOST=redis`) instead of `localhost`.