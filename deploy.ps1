$worktreePath = "C:\tmp\be-worktree"
if (Test-Path $worktreePath) {
    git worktree remove $worktreePath --force
}
git worktree prune
git worktree add $worktreePath backend-easy/dev

if (!(Test-Path "$worktreePath\src")) { New-Item -ItemType Directory -Path "$worktreePath\src" -Force | Out-Null }
if (!(Test-Path "$worktreePath\prisma")) { New-Item -ItemType Directory -Path "$worktreePath\prisma" -Force | Out-Null }

Copy-Item -Path "Nestjs_Backend\src\*" -Destination "$worktreePath\src\" -Recurse -Force
Copy-Item -Path "Nestjs_Backend\prisma\schema.prisma" -Destination "$worktreePath\prisma\" -Force
Copy-Item -Path "Nestjs_Backend\Dockerfile" -Destination "$worktreePath\" -Force
Copy-Item -Path "Nestjs_Backend\.dockerignore" -Destination "$worktreePath\" -Force

Set-Location $worktreePath
pnpm install --frozen-lockfile
if ($LASTEXITCODE -ne 0) { throw "pnpm install failed" }

pnpm prisma generate
if ($LASTEXITCODE -ne 0) { throw "pnpm prisma generate failed" }

pnpm lint
if ($LASTEXITCODE -ne 0) { throw "pnpm lint failed" }

pnpm test --passWithNoTests --ci
if ($LASTEXITCODE -ne 0) { throw "pnpm test failed" }

pnpm build
if ($LASTEXITCODE -ne 0) { throw "pnpm build failed" }

git add -A
git commit -m "fix(docker): inject dummy env vars for Prisma generate to fix deployment"
git push backend-easy dev
if ($LASTEXITCODE -ne 0) { throw "git push failed" }
