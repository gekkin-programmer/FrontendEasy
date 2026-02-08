# LLM Context

## Project Overview
EasyPostV2 is an AI-powered social media management platform with a NestJS backend and Next.js frontend.

## Key Architectural Decisions
- **ORM**: Prisma with PostgreSQL.
- **Auth**: JWT-based with session management in the database.
- **Workspaces**: Multi-tenant architecture where users belong to workspaces via `WorkspaceMember`.
- **Media**: Folder-based management system for assets.
- **Real-time**: WebSockets used for instant dashboard updates.

## Critical State / Recent Fixes
- **Auth Note**: The `JwtStrategy` returns `{ sub: userId }`. Therefore, controllers must use `req.user.sub` to access the user's ID, not `req.user.id`.
- **Kanban System**: Added a multi-board Kanban system per workspace. 
  - `Board` -> `BoardColumn` -> `Card` hierarchy.
  - `Card` relates to `User` (assignee/creator) and `Post` (for conversion).
  - Uses `@dnd-kit` for frontend drag-and-drop.
  - Managed via `BoardsService` in `Nestjs_Backend`.
- **2026-02-07**: Resolved 40 build errors by restoring missing Prisma models...
- **Schema Constraints**: `ChatChannel` must have a unique constraint on `@@unique([workspaceId, name])`.
- **Approval Flow**: Implemented team approval system for posts.
- **Asset Visibility**: Fixed issues where media assets were not correctly scoped or visible in the explorer.
- **Social Integration**: Fixed workspace data leaks and ensured proper context in the post composer.
