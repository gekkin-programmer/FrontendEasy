# Frontend Deep Dive — Next.js 16 (EazyPost)

## Design System: Neubrutalism
- **Core Aesthetic:** High contrast, 2–4px solid black borders, and hard shadows (`shadow-[4px_4px_0px_0px_#000]`).
- **Typography:** JetBrains Mono (Global).
- **Colors:** Brand (`#3C48F5`), Light BG (`#F4F4F0`), Dark BG (`#000000`).
- **Icons:** Lucide React + Lord Icon (animated).

## Routing Architecture
- **Public:** `/`, `/about`, `/pricing`, `/login`, `/signup`, `/auth/callback`.
- **Dashboard (Protected):** - `/dashboard` (Home)
  - `/dashboard/[workspaceId]/settings`
  - `/dashboard/analytics`, `/dashboard/projects`
- **Admin:** `/admin`, `/admin/users`, `/admin/feedback`.

## i18n & State Management
- **i18n:** Context-based (LanguageContext). Use `t("English", "Français")`. Supports `en` and `fr`.
- **State:** TanStack Query v5.
  - Configuration: `staleTime: 60000` (1 min), `retry: 1`.
- **API:** Always use `src/lib/api.ts` (Axios wrapper).
  - Handles: Automatic JWT injection from `accessToken` cookie and 401 redirects.

## Critical Components
- `AgentationLoader`: Dev-only overlay for visual feedback (must stay in `layout.tsx`).
- `SocketContext`: Manages WebSocket connection to the `/events` namespace.