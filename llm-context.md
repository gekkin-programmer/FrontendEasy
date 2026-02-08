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
- **Real-Time System**: 
  - `AppEventsGateway` (namespace: `events`) handles workspace-level rooms (`workspace_{id}`) and user-level rooms (`user_{id}`).
  - Used by `PostsService`, `BoardsService`, and `NotificationsService` to emit events.
  - Listeners are globally managed in `SocketContext.tsx` and specific components.
- **Notifications**: 
  - New `NotificationsModule` handles persistent and real-time alerts.
  - Endpoint `PATCH /notifications/:id/read` marks individual items as read.
- **Calendar Heatmap**: 
  - Visualizes engagement scores for all 168 hours of the week.
  - Python ML service returns `heatmap` array when `full_week` param is true.
  - Next.js component `CalendarHeatmap` handles the visualization grid.
- **AI Smart Scheduling**: 
  - Python microservice (`ml_service`) runs FastAPI on port 8000.
  - Uses Scikit-learn's `RandomForestRegressor` to predict best times based on 90-day history.
  - Cyclical encoding applied to timestamps.
- **Auth Note**: The `JwtStrategy` returns `{ sub: userId }`...
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
