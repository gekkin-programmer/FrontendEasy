# EazyPost — Deploy & CI/CD Reference

> For AI tools and engineers. Read this before touching git or pushing any code.

---

## 1. Repository Structure

There are **3 git repositories**. Work happens in the monorepo; deploys go through the two standalone repos.

| Repo | Remote name | URL | Purpose |
|------|-------------|-----|---------|
| **EasyPostV2** (monorepo) | `origin` | github.com/gekkin-programmer/EasyPostV2 | Primary workspace. All code lives here. |
| **FrontendEasy** (standalone) | `frontend-easy` | github.com/gekkin-programmer/FrontendEasy | Deployed frontend. CI/CD lives here. |
| **BackendEasy** (standalone) | `backend-easy` | github.com/gekkin-programmer/BackendEasy | Deployed backend. CI/CD lives here. |

### Monorepo layout

```
EasyPostV2/f
├── frontend-next/      ← Next.js 16 source
├── Nestjs_Backend/     ← NestJS 11 source
├── ml_service/         ← FastAPI (not deployed via CI yet)
├── docker-compose.yml  ← LOCAL dev only (Redis + all services)
└── CLAUDE.md
```

### Standalone repo layout (FrontendEasy / BackendEasy)

Both standalone repos have their source files **at the root level** — not in a subdirectory.

```
FrontendEasy/           BackendEasy/
├── src/                ├── src/
├── Dockerfile          ├── Dockerfile
├── package.json        ├── package.json
├── ...                 ├── prisma/
└── .github/workflows/  └── .github/workflows/
    └── ci.yml              └── ci.yml
```

---

## 2. Golden Rule: Never Push to Origin

**NEVER push to `origin` (EasyPostV2 monorepo).**
All production deployments go through `frontend-easy` and `backend-easy` only.

---

## 3. How to Push Code (Worktree Workflow)

The standalone repos have files at root level. The monorepo has them in subdirectories. The bridge is **git worktrees** + file copy.

### 3a. One-time setup (if worktrees don't exist yet)

```bash
# Frontend
git worktree add /c/Users/BC-USER/AppData/Local/Temp/fe-worktree frontend-easy/dev

# Backend
git worktree add /c/Users/BC-USER/AppData/Local/Temp/be-worktree backend-easy/dev
```

If you get "already exists" or the worktree is stale, recover it:

```bash
git worktree remove /c/Users/BC-USER/AppData/Local/Temp/fe-worktree --force
rm -rf /c/Users/BC-USER/AppData/Local/Temp/fe-worktree
git worktree add /c/Users/BC-USER/AppData/Local/Temp/fe-worktree frontend-easy/dev
# same pattern for be-worktree
```

---

### 3b. Frontend push (step by step)

```bash
# 1. Copy source from monorepo into the worktree (note the trailing /. — copies contents, not the dir itself)
cp -rf frontend-next/src/. /c/Users/BC-USER/AppData/Local/Temp/fe-worktree/src/
cp -rf frontend-next/services/. /c/Users/BC-USER/AppData/Local/Temp/fe-worktree/services/

# 2. Commit from INSIDE the worktree
cd /c/Users/BC-USER/AppData/Local/Temp/fe-worktree
git add -A
git commit -m "feat: your message here"

# 3. Push to FrontendEasy dev branch
git push frontend-easy HEAD:dev
```

Do NOT use `fe-dev:dev` — `fe-dev` is a stale monorepo branch.

---

### 3c. Backend push (step by step)

```bash
# 1. Copy source from monorepo into the worktree
cp -rf Nestjs_Backend/src/. /c/Users/BC-USER/AppData/Local/Temp/be-worktree/src/
cp -f Nestjs_Backend/Dockerfile /c/Users/BC-USER/AppData/Local/Temp/be-worktree/Dockerfile
cp -f Nestjs_Backend/prisma/schema.prisma /c/Users/BC-USER/AppData/Local/Temp/be-worktree/prisma/schema.prisma

# 2. Commit from INSIDE the worktree
cd /c/Users/BC-USER/AppData/Local/Temp/be-worktree
git add -A
git commit -m "feat: your message here"

# 3. Push to BackendEasy dev branch
git push backend-easy HEAD:dev
```

If the push is rejected (non-fast-forward), the remote is ahead — rebase and retry:

```bash
git fetch backend-easy
git rebase backend-easy/dev
git push backend-easy HEAD:dev
```

---

### 3d. What to copy — and what NOT to copy

**Frontend — copy these from monorepo:**
| Source | Destination |
|--------|-------------|
| `frontend-next/src/` | `fe-worktree/src/` |
| `frontend-next/services/` | `fe-worktree/services/` |

**Backend — copy these from monorepo:**
| Source | Destination |
|--------|-------------|
| `Nestjs_Backend/src/` | `be-worktree/src/` |
| `Nestjs_Backend/Dockerfile` | `be-worktree/Dockerfile` |
| `Nestjs_Backend/prisma/schema.prisma` | `be-worktree/prisma/schema.prisma` |

**Never copy these to BackendEasy:**

- `CLAUDE.md` — AI context file, not for deployment
- Root `docker-compose.yml` — the monorepo one includes Redis + Nginx + all services; BackendEasy has its own minimal one for Dokploy
- `.claude/` directory
- `.github/` directory from the monorepo
- `node_modules/`, `dist/`, `.next/`

---

## 4. CI/CD Pipelines

### FrontendEasy pipeline (triggered on push to `dev`)

```
push to FrontendEasy/dev
  └── Job 1: frontend-checks
        pnpm install --frozen-lockfile
        pnpm lint
        pnpm test --passWithNoTests --ci
        pnpm build
          │
          ▼  passes
  └── Job 2: build-and-push
        Build Docker image (GitHub Actions 7 GB runner)
        Push → ghcr.io/gekkin-programmer/eazypost-frontend:latest
          │
          ▼  image is live in GHCR
  └── Job 3: promote-to-main
        git reset --hard origin/dev → main
        git push origin main --force-with-lease
        curl POST → Dokploy webhook → pulls new image → redeploys
```

### BackendEasy pipeline (triggered on push to `dev`)

```
push to BackendEasy/dev
  └── Job 1: backend-checks
        pnpm install --frozen-lockfile
        pnpm prisma generate           ← MUST run before lint
        pnpm lint
        pnpm test --passWithNoTests --ci
        pnpm build
          │
          ▼  passes
  └── Job 2: build-and-push
        Build Docker image
        Push → ghcr.io/gekkin-programmer/eazypost-backend:latest
          │
          ▼  (runs in parallel with Job 3)
  └── Job 3: promote-to-main
        git merge origin/dev --ff-only → main
        git push origin main

  └── Job 4: deploy-to-dokploy
        curl GET → Dokploy refresh token → pull new image → redeploy
```

### Key difference between the two

- Frontend promotes via **force-with-lease reset** (replaces main with dev exactly).
- Backend promotes via **fast-forward merge** (main must be an ancestor of dev).
- Both jobs 3 and 4 in the backend run after Job 2 (image must be in GHCR before Dokploy fires).

---

## 5. Production URLs

| Service | URL | Deployed from |
|---------|-----|---------------|
| Frontend | https://eazypost.cm | FrontendEasy/main via Dokploy |
| Backend API | https://backend-eazypost.mbokofit.com | BackendEasy/main via Dokploy |
| Dokploy admin | https://admin.zylo-platform.cloud | — |
| Database | Neon PostgreSQL (serverless) | — |

---

## 6. Local Dev Ports

| Service | Port | Start command |
|---------|------|---------------|
| Frontend | 3001 | `cd frontend-next && pnpm dev -- -p 3001` |
| Backend | 3000 | `cd Nestjs_Backend && pnpm run start:dev` |
| ML service | 8000 | `cd ml_service && uvicorn main:app --reload --port 8000` |

---

## 7. Decision Tree: "Where do I push this change?"

```
Did I change files in frontend-next/?
  YES → copy src/ and services/ to fe-worktree → push frontend-easy HEAD:dev

Did I change files in Nestjs_Backend/?
  YES → copy src/, Dockerfile, prisma/schema.prisma to be-worktree → push backend-easy HEAD:dev

Did I change both?
  YES → do both pushes (independent, can be done in either order)

Did I ONLY change ml_service/?
  → No CI/CD for ML yet. Inform the user; manual deploy needed.

Should I push to origin (EasyPostV2)?
  NEVER. Origin is the monorepo scratch pad. Do not push there.
```
