# Prompt: Sync Monorepo Changes to Service Repos

Use this prompt verbatim when asking another LLM to push staged monorepo changes to BackendEasy and/or FrontendEasy.

---

## Context

This is a monorepo at `C:\Users\BC-USER\Desktop\EasyPostV2` (or `/c/Users/BC-USER/Desktop/EasyPostV2` in bash). It has three services, each with its own standalone GitHub repo used for CI/CD:

| Service | Monorepo folder | Standalone repo remote | Standalone repo layout |
|---------|----------------|----------------------|------------------------|
| NestJS Backend | `Nestjs_Backend/` | `backend-easy` → BackendEasy | files at **root** |
| Next.js Frontend | `frontend-next/` | `frontend-easy` → FrontendEasy | files at **root** |
| ML service | `ml_service/` | lives inside BackendEasy as `ml_service/` subdirectory | — |

Git remotes registered on the monorepo:
```
origin         https://github.com/gekkin-programmer/EasyPostV2
frontend-easy  https://github.com/gekkin-programmer/FrontendEasy
backend-easy   https://github.com/gekkin-programmer/BackendEasy
```

The worktrees are persistent on this machine (check with `git worktree list`):
- Backend worktree: likely at `/c/Users/BC-USER/AppData/Local/Temp/be-worktree` → branch `dev` of `backend-easy`
- Frontend worktree: likely at `/c/Users/BC-USER/AppData/Local/Temp/fe-worktree` → branch `fe-dev` of `frontend-easy`

If a worktree is missing or stale:
```bash
git worktree remove /c/Users/BC-USER/AppData/Local/Temp/be-worktree --force
git worktree add /c/Users/BC-USER/AppData/Local/Temp/be-worktree backend-easy/dev

git worktree remove /c/Users/BC-USER/AppData/Local/Temp/fe-worktree --force
git worktree add /c/Users/BC-USER/AppData/Local/Temp/fe-worktree frontend-easy/fe-dev
```

---

## Your Task

Identify which services have uncommitted or un-pushed changes in the monorepo, then push those changes to the correct standalone repo(s) following the exact workflow below. Do this without breaking the git flow (no force-push to main, no skipping CI).

---

## Step 1 — Identify what changed

```bash
cd /c/Users/BC-USER/Desktop/EasyPostV2

# See all modified files in the monorepo
git status

# See what's changed vs the last commit
git diff --name-only HEAD
```

Classify each changed file:
- Files under `Nestjs_Backend/` or `ml_service/` → **Backend change** → push to `backend-easy/dev`
- Files under `frontend-next/` → **Frontend change** → push to `frontend-easy/fe-dev` (or `dev` — check with `git branch -r | grep frontend`)
- Files that are `CLAUDE.md`, `.claude/`, `.github/`, root `docker-compose.yml` → **NEVER push to any service repo**

---

## Step 2 — Commit any pending changes to the monorepo first

If there are uncommitted changes in the monorepo that you intend to push:
```bash
cd /c/Users/BC-USER/Desktop/EasyPostV2
git add <specific files>   # Never git add -A blindly — avoid committing .env, secrets
git commit -m "feat/fix: <describe what changed>"
```

---

## Step 3 — Push Backend changes to BackendEasy

Only do this if there are backend-related changes.

```bash
# 3a. Confirm worktree is on the right branch
cd /c/Users/BC-USER/AppData/Local/Temp/be-worktree
git branch   # should show: * dev

# 3b. Sync source files (copy from monorepo into worktree)
# IMPORTANT: use trailing /. on source to avoid src/src/ nesting
cp -rf /c/Users/BC-USER/Desktop/EasyPostV2/Nestjs_Backend/src/. /c/Users/BC-USER/AppData/Local/Temp/be-worktree/src/
cp -f  /c/Users/BC-USER/Desktop/EasyPostV2/Nestjs_Backend/prisma/schema.prisma /c/Users/BC-USER/AppData/Local/Temp/be-worktree/prisma/schema.prisma
cp -f  /c/Users/BC-USER/Desktop/EasyPostV2/Nestjs_Backend/package.json /c/Users/BC-USER/AppData/Local/Temp/be-worktree/package.json
cp -f  /c/Users/BC-USER/Desktop/EasyPostV2/Nestjs_Backend/pnpm-lock.yaml /c/Users/BC-USER/AppData/Local/Temp/be-worktree/pnpm-lock.yaml
cp -f  /c/Users/BC-USER/Desktop/EasyPostV2/Nestjs_Backend/eslint.config.mjs /c/Users/BC-USER/AppData/Local/Temp/be-worktree/eslint.config.mjs
cp -f  /c/Users/BC-USER/Desktop/EasyPostV2/Nestjs_Backend/Dockerfile /c/Users/BC-USER/AppData/Local/Temp/be-worktree/Dockerfile
cp -f  /c/Users/BC-USER/Desktop/EasyPostV2/Nestjs_Backend/.dockerignore /c/Users/BC-USER/AppData/Local/Temp/be-worktree/.dockerignore

# Also copy ml_service if it changed
cp -rf /c/Users/BC-USER/Desktop/EasyPostV2/ml_service/. /c/Users/BC-USER/AppData/Local/Temp/be-worktree/ml_service/

# 3c. DO NOT overwrite BackendEasy's docker-compose.yml with the monorepo one.
#     BackendEasy has its own Dokploy deploy compose (redis + backend + ml_service).
#     It hardcodes REDIS_HOST=redis in the backend environment block so containers
#     resolve Redis by service name — this must stay as-is.
#     The root monorepo docker-compose.yml (Redis + Backend + Frontend + Nginx) must NEVER go to BackendEasy.

# 3d. Run CI checks LOCALLY before pushing — fix any errors before proceeding
cd /c/Users/BC-USER/AppData/Local/Temp/be-worktree
pnpm install --frozen-lockfile
pnpm prisma generate           # must run before lint/test/build
pnpm lint                      # must exit 0 errors (warnings are OK)
pnpm test --passWithNoTests --ci
pnpm build

# 3e. Stage, commit, push
git add -A
git commit -m "feat/fix: <describe the changes>"
git push backend-easy dev
```

---

## Step 4 — Push Frontend changes to FrontendEasy

Only do this if there are frontend-related changes.

```bash
# 4a. Confirm worktree is on the right branch
cd /c/Users/BC-USER/AppData/Local/Temp/fe-worktree
git branch   # check which branch — typically fe-dev or dev

# 4b. Sync source files
cp -rf /c/Users/BC-USER/Desktop/EasyPostV2/frontend-next/src/. /c/Users/BC-USER/AppData/Local/Temp/fe-worktree/src/
cp -f  /c/Users/BC-USER/Desktop/EasyPostV2/frontend-next/package.json /c/Users/BC-USER/AppData/Local/Temp/fe-worktree/package.json
cp -f  /c/Users/BC-USER/Desktop/EasyPostV2/frontend-next/pnpm-lock.yaml /c/Users/BC-USER/AppData/Local/Temp/fe-worktree/pnpm-lock.yaml
cp -f  /c/Users/BC-USER/Desktop/EasyPostV2/frontend-next/next.config.ts /c/Users/BC-USER/AppData/Local/Temp/fe-worktree/next.config.ts 2>/dev/null || true
cp -f  /c/Users/BC-USER/Desktop/EasyPostV2/frontend-next/tailwind.config.ts /c/Users/BC-USER/AppData/Local/Temp/fe-worktree/tailwind.config.ts 2>/dev/null || true
cp -f  /c/Users/BC-USER/Desktop/EasyPostV2/frontend-next/tsconfig.json /c/Users/BC-USER/AppData/Local/Temp/fe-worktree/tsconfig.json 2>/dev/null || true

# 4c. Run CI checks LOCALLY before pushing
cd /c/Users/BC-USER/AppData/Local/Temp/fe-worktree
pnpm install --frozen-lockfile
pnpm lint
pnpm test --passWithNoTests --ci
pnpm build

# 4d. Stage, commit, push
git add -A
git commit -m "feat/fix: <describe the changes>"
git push frontend-easy <branch>   # use the branch name you confirmed in 4a
```

---

## What NOT to do

- **Never `git push --force` to `main`** on either service repo — CI auto-promotes `dev → main` after passing.
- **Never copy** `CLAUDE.md`, `.claude/`, `.github/`, root `docker-compose.yml` to any service repo.
- **Never skip CI** (`--no-verify`, etc.) — fix the errors locally first.
- **Never use `npm` or `yarn`** — pnpm only across all services.
- **Never overwrite** BackendEasy's `docker-compose.yml` with the monorepo root one — BackendEasy's compose defines its own `redis` service and sets `REDIS_HOST=redis`; the monorepo one adds Nginx and the frontend.
- **Never use `cp -rf src/`** (without trailing `/.`) into an existing `src/` — it creates `src/src/` nesting.

---

## Key rules to pass CI

**Backend:**
- `pnpm prisma generate` must run before lint, test, or build.
- ESLint `no-unused-vars` is `error` — remove unused imports or prefix unused parameters with `_`.
- All `no-unsafe-*` rules are downgraded to `warn` — these won't fail CI.
- `test/` directory is excluded from ESLint (e2e specs, not Jest).
- Catch variables: use `catch {` not `catch (e)` or `catch (_e)`.
- Dockerfile builder stage uses `corepack enable pnpm && pnpm run build`.

**Frontend:**
- Jest must exclude `e2e/` via `testPathIgnorePatterns`.
- Use `src/lib/api.ts` for all HTTP — never raw `fetch` or `axios`.
- i18n via `t("EN", "FR")` from `useLanguage()` — never hardcoded strings.

---

## Verifying success

After pushing, CI will run automatically on GitHub. You can monitor it with:
```bash
# Requires gh CLI authenticated
gh run list --repo gekkin-programmer/BackendEasy --limit 5
gh run list --repo gekkin-programmer/FrontendEasy --limit 5
```

CI passes → auto-promotes `dev → main` → Dokploy autodeploys.
