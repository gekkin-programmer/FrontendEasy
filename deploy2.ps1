$worktreePath = "C:\Users\BC-USER\AppData\Local\Temp\be-worktree"

# Ensure directories exist
if (!(Test-Path "$worktreePath\src")) { New-Item -ItemType Directory -Path "$worktreePath\src" -Force | Out-Null }
if (!(Test-Path "$worktreePath\prisma")) { New-Item -ItemType Directory -Path "$worktreePath\prisma" -Force | Out-Null }

# Sync source
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
git commit -m "fix(docker): inject dummy env vars for Prisma generate to fix Dokploy deployment"
git push backend-easy dev
if ($LASTEXITCODE -ne 0) { throw "git push failed" }
