# Project Updates

## 2026-02-07
- fix(boards): resolved drag-and-drop issues by correctly identifying target columns via metadata.
- feat(boards): added ability to rename boards and columns.
- fix(boards): resolve board creation error by using `req.user.sub` instead of `req.user.id` in `BoardsController`.
- feat(kanban): implement full workspace-based Kanban system.
  - Backend: Added Prisma models (`Board`, `BoardColumn`, `Card`, `CardComment`, `CardActivity`, `CardLabel`).
  - Backend: Created `BoardsModule` with comprehensive service and controller for board/card management.
  - Backend: Implemented "Convert to Post" logic to sync cards to social media drafts.
  - Frontend: Integrated `Boards` tab into the Workspace Dashboard.
  - Frontend: Developed `BoardView` with board lists, Kanban views, and card inspectors.
  - Frontend: Implemented drag-and-drop using `@dnd-kit`.
- fix(backend): restore missing prisma models and fields to resolve 40 build errors.
  - Added `ChatChannel` unique constraint on `[workspaceId, name]`.
  - Restored Enums: `UserRole`, `FeedbackStatus`, `FeedbackCategory`, `ApplicationStatus`, `TransactionStatus`.
  - Restored `User` fields: `role`, `planExpiresAt`.
  - Restored Relations: `receivedGrants`, `issuedGrants`, `communityFeedback`, `feedbackUpvotes`, `creatorApplications`, `transactions`.
  - Restored Models: `AccessGrant`, `CommunityFeedback`, `FeedbackUpvote`, `CreatorApplication`, `Transaction`.
- build(backend): force render build trigger for restored schema.

## Recent History
- fix(media): resolve asset visibility and final approval flow integration.
- fix(prisma): full schema restoration and proper notification integration.
- feat(workflow): implement team approvals and fix asset explorer visibility.
- feat(workflow): implement team approval flow and clean asset explorer integration.
- fix(dashboard): unified asset explorer view and enabled deletion of published posts.
- fix(post-feed): resolve deletion failures and fix 'Unknown' labels by using real social account data.
- fix(calendar): show all platform icons per post and correct total node count.
- feat(media): implement full folder management system and target-based live previews.
- fix(social-commerce): add tiktok icon, implement commerce link generation, and fix post deletion sync.
- fix(sync): resolve incorrect workspace data leak and ensure proper post context in composer.
- fix(dashboard): ensure immediate UI refresh on websocket events and fix scheduling workspace mismatch.
- fix(social-accounts): robust session check in twitter and tiktok guards to prevent callback failures.
- fix(calendar): enable drop on empty cells and resolve post creation workspace mismatch.
- feat(frontend): functional notification bell and header cleanup.
- feat(real-time): implement full-stack websockets for instant dashboard updates.
- feat(backend): implement secure websocket gateway for real-time events.
- feat(frontend-next): implement visual calendar with drag-and-drop rescheduling.
