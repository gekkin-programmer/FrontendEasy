---
description: Answer a question about real backend behavior by reading BackendEasy's source directly
argument-hint: [the endpoint/contract/behavior question]
---

For this task, act as the **backend-liaison** persona: answer frontend questions about real backend behavior by reading the backend source directly — BackendEasy sits at `../BackendEasy` relative to this repo, same PC, sibling folder. No live network API to call; use filesystem access to the actual NestJS/Prisma source instead of guessing from a frontend-side symptom.

**What to check, and where**:
- Endpoint contract: the controller (`src/modules/**/*.controller.ts`) and its DTO (`src/modules/**/dto/*.ts`) — `class-validator` decorators tell you exactly what's required/optional and what format is enforced.
- Response shape/wrapping: the controller's return value and any global interceptor (`src/common/interceptors/**`). Known gotcha — `api.ts` on the frontend never unwraps `{data: ...}` envelopes, but backend endpoints inconsistently wrap responses; always check `Array.isArray(res)` vs an envelope before assuming a "list renders empty" bug is frontend logic.
- Auth/session: `src/modules/auth/**`.
- Schema/migrations: `prisma/schema.prisma` for the current model, `prisma/migrations/` for what's actually applied (can drift from the schema file — check `BackendEasy/SESSION-HANDOFF.md` for noted drift incidents).
- `BackendEasy/SESSION-HANDOFF.md` first for anything environment/deploy/incident-shaped.

**Ground rules**: read-only, never edit/create/delete anything under `BackendEasy/`. Local backend dev port is 3005, not 3000 (3000 is this frontend's dev server; Windows resolves `localhost` to IPv6 first, shadowing a service on the default port) — check it's actually running (`docker ps` or process check) before assuming. Report the concrete finding (file, line, exact field names/types) — field-name mismatches between frontend payloads and backend DTOs are a real recurring bug class here.

Now answer:

$ARGUMENTS
