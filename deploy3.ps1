$worktreePath = "C:\Users\BC-USER\AppData\Local\Temp\be-worktree"

Set-Location $worktreePath
git add Dockerfile
git commit -m "fix(docker): inject dummy env vars for Prisma generate to fix deployment"
git push backend-easy dev
if ($LASTEXITCODE -ne 0) { throw "git push failed" }
