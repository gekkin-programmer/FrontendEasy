# Updates Log

This file tracks all changes made to the codebase for maintainability and transparency.

## 2026-01-29

### Backend (Nestjs_Backend)
- **Swagger Documentation Setup**:
  - Modified `Nestjs_Backend/src/main.ts`:
    - Changed Swagger UI path to `/api-docs` to match `Final-Configuration.md`.
    - Disabled `useGlobalPrefix` for Swagger to serve it at the root.
    - Fixed `helmet` import error (changed `@nestjs/helmet` to `helmet`).
  - Modified `Nestjs_Backend/src/app.controller.ts`:
    - Added `@ApiTags('health')`, `@ApiOperation`, and `@ApiResponse` decorators to `getHello` and `healthCheck` endpoints for better documentation.
  - Verified `AuthController` and `PostsController` for existing Swagger decorators.
  - Confirmed successful build with `pnpm run build`.

- **Testing**:
  - Verified `uuid` import issue and resolved it (downgraded to `uuid@9.0.1` compatible with CommonJS).
  - Created basic unit test for `PostsService` (`src/modules/posts/posts.service.spec.ts`).
  - Verified tests pass with `pnpm test`.

- **CI/CD**:
  - Created `.github/workflows/ci.yml` for automated testing and building.
  - configured jobs for both Backend (`Nestjs_Backend`) and Frontend (`frontend-next`) using `pnpm`.

- **Monitoring & Logging**:
  - **Backend**:
    - Installed Sentry (@sentry/nestjs) and Pino (@nestjs-pino).
    - Added `instrument.ts` for Sentry initialization.
    - Integrated `LoggerModule` (Pino) for high-performance JSON logging.
    - Configured `pino-pretty` for development readability.
  - **Frontend**:
    - Installed `@sentry/nextjs`.
    - Configured client, server, and edge Sentry files.
    - Wrapped Next.js config with Sentry.
  - Created `.env.example` for both services.

- **CI/CD Fixes**:
  - **Frontend**: Fixed `next.config.ts` Sentry configuration (merged config objects and removed deprecated options like `transpileClientSDK` and `hideSourceMaps`).
  - **Backend**: Fixed `ChatService` and `ChatController` tests by properly mocking `PrismaService` and `ChatService` dependencies.
  - Verified that all backend unit tests pass locally.

- **Documentation**:
  - Rewrote root `README.md` to be production-ready:
    - Added architecture diagram (Mermaid).
    - Updated tech stack to include NestJS and Next.js.
    - Added production URLs and setup instructions using `pnpm`.
    - Added CI status badges.

## 2026-01-30

### MVP Verification & Stability
- **Backend Testing (Nestjs_Backend)**:
  - Created `AuthService` unit tests (`src/modules/auth/auth.service.spec.ts`) covering registration, login, JWT generation, and Google OAuth.
  - Created `WorkspacesService` unit tests (`src/modules/workspaces/workspaces.service.spec.ts`) covering creation, details, updates, and permission-based archiving.
  - Created `MembersService` unit tests (`src/modules/workspaces/members/members.service.spec.ts`) for invitation workflows (shadow users), role management, and access control.
  - Expanded `PostsService` unit tests (`src/modules/posts/posts.service.spec.ts`) to cover text/image creation, status-based filtering, and strict state protections (edit/delete published posts).
  - Created `SchedulerService` unit tests (`src/modules/posts/scheduler/scheduler.service.spec.ts`) covering scheduling, rescheduling, cancellation, and automation workflows.
  - Created `SocialAccountsService` unit tests (`src/modules/social-accounts/social-accounts.service.spec.ts`) covering Facebook OAuth callback, token storage, page fetching, and account disconnection.
  - Created `PublisherService` unit tests (`src/modules/posts/publishing/publisher.service.spec.ts`) covering multi-platform publishing, partial failures, and recovery.
  - Created **`AiService` unit tests** (`src/modules/ai/ai.service.spec.ts`) covering copy generation, tone/length application, usage limits, and error handling.
  - Verified all tests pass locally with `pnpm test`.

- **AI Engine Refinement (Nestjs_Backend)**:
  - Enhanced `AiService` with **Usage Limits Enforcement**: `FREE` plan users are now limited to 10 requests per month.
  - Added support for **Content Lengths** (`SHORT`, `MEDIUM`, `LONG`) in marketing copy generation.
  - Standardized `PrismaService` imports to use relative paths for better portability.
- **Publishing & Reliability Refinement (Nestjs_Backend)**:
  - Added **Double-Publication Protection** in `PublisherService` to prevent re-publishing already successful posts.
  - Implemented **Retry Logic** (up to 2 attempts) for social platform API calls to handle temporary glitches.
  - Improved **Error Tracking**: failure messages from platforms are now correctly stored in `PostSocialAccount` for user feedback.
- **Scheduling & Automation Refinement (Nestjs_Backend)**:
  - Enhanced `SchedulerService` with methods for **scheduling**, **rescheduling**, and **cancelling** posts.
  - Added strict validation to prevent scheduling in the past and double-scheduling.
  - Validated the **auto-publish** logic triggered by Cron jobs.
- **Post Integrity & Safety (Nestjs_Backend)**:
  - Updated `PostsService.remove` to **prevent deleting published posts**, mirroring the edit protection and ensuring historical record integrity.
  - Validated that `currentPostCount` increment logic correctly supports future subscription limit enforcements.

- **Frontend-Backend Integration (frontend-next)**:
  - **Security**: Added `credentials: 'include'` to the `api` fetch wrapper in `src/lib/api.ts` to ensure secure cookies (refreshToken) are sent in cross-origin requests.
  - **Auth Flow Fix**: Modified `AuthCallbackPage` (`src/app/auth/callback/page.tsx`) to handle Google Auth redirect correctly by only requiring `accessToken` (since `refreshToken` is securely handled via cookies).
  - **Logout Fix**: Updated `Navbar.tsx` to simplify the logout process, relying on backend cookie clearance instead of manual local storage management of the refresh token.
  - **Critical Bug Fix**: Fixed a copy-paste error in `DashboardPage` (`src/app/dashboard/[id]/page.tsx`) where posts were being fetched from the `/social-accounts` endpoint instead of `/posts`.
  - **Library Imports**: Corrected `api` imports in `Composer.tsx`, `EasyAI.tsx`, and `VoiceAiButton.tsx` to use named imports instead of default imports.

- **Final Build Stability & Cleanup**:
  - **API Consolidation**: Removed redundant and obsolete `frontend-next/lib/api.ts` and `frontend-next/src/api.ts` (Axios-based) in favor of the robust fetch-based client at `@/src/lib/api`.
  - **Service Updates**: Refactored `aiApi.ts` and `postApi.ts` to align with the new standardized `api` client signature.
  - **TypeScript Resolution**: Fixed multiple `res` and `data` type errors in `Composer.tsx`, `EasyAI.tsx`, `VoiceAiButton.tsx`, and `DashboardPage` that were blocking the Vercel production build.
  - **Build Verification**: Confirmed that `pnpm run build` now completes successfully for the entire frontend.

- **E2E Testing Infrastructure (frontend-next)**:
  - Installed and configured **Playwright** for End-to-End testing.
  - Created `playwright.config.ts` with local server auto-start configuration.
  - Implemented `e2e/auth.spec.ts` covering Signup, Login, and Logout flows.
  - Implemented `e2e/profile.spec.ts` for profile update verification.
- **Backend Testing Support (Nestjs_Backend)**:
  - Added an **E2E Backdoor** in `AuthService.register` to allow the fixed OTP `123456` when `NODE_ENV` is not `production`, enabling automated registration tests without email access.

- **Post Management E2E (frontend-next)**:
  - Implemented `e2e/posts.spec.ts` covering:
    - Text post creation (Draft & Scheduled).
    - Image post creation.
    - **Edit Post**: Full cycle (click edit -> populate form -> update -> verify).
    - **Delete Post**: Verification of removal from feed.
    - **Filtering**: Verification of Draft vs Queue column separation.
  - Implemented `e2e/limits.spec.ts` covering post limits and published post constraints.
  - Implemented **`e2e/scheduling.spec.ts`** covering:
    - Future post scheduling and validation.
    - Past date rejection UI check.
    - Calendar view navigation and post click interaction.
    - Rescheduling flow (calendar -> edit mode).
  - Implemented `e2e/ai.spec.ts` covering Pro usage, feedback loop, and error handling.
  - Implemented `e2e/media.spec.ts` covering image upload, library management, and deletion.
  - Implemented **`e2e/analytics.spec.ts`** covering overview cards and strategic insights.
  - Configured `playwright.config.ts` with increased timeouts and `test:e2e:server` script.

- **Analytics Hub (Full-Stack)**:
  - **Backend**: Enhanced `AnalyticsService` to provide real-time counts for Drafts, Scheduled, and Published posts.
  - **Frontend**: Added Neubrutalist Overview cards and integrated Live Stream with real platform metrics.


- **Media Engine & Storage (Full-Stack)**:
  - **Backend**: 
    - Enhanced `MediaService` with **Storage Limit Enforcement** (100MB for FREE plan).
    - Added `GET /media/usage` and `DELETE /media/:id` endpoints.
    - Integrated automatic storage usage tracking via Prisma aggregates.
  - **Frontend**:
    - **Live Library**: Refactored `MediaGallery.tsx` from mock data to real API integration with React Query.
    - **Storage UI**: Added a real-time storage usage indicator with a progress bar.
    - **Safety**: Added confirmation dialogs for media deletion and robust error handling for failed uploads.


- **AI Engine & Assistant (Full-Stack)**:
  - **Backend**: Added usage limits (10/month for FREE), token tracking, and feedback logging in `AiService`.
  - **Frontend**:
    - **Feedback UI**: Added Thumbs Up/Down buttons to AI messages in `EasyAI.tsx` to collect user sentiment.
    - **Error Handling**: Improved user feedback when AI services are unreachable.
    - **API Refinement**: Updated `AiController` and DTOs to support content length selection (`SHORT`, `MEDIUM`, `LONG`).

- **Post Scheduling & Calendar (Full-Stack)**:
  - **Backend**: Added **`GET /api/posts/calendar`** endpoint and `findInDateRange` service logic to support date-aware content display.
  - **Frontend**:
    - **Calendar Integration**: Updated `CalendarView.tsx` to handle post clicks, enabling a seamless transition from the timeline to edit mode.
    - **Rescheduling Flow**: Wired up `DashboardPage` to populate the `Composer` with post data when a calendar item is clicked.
    - **Validation**: Added client-side past-date validation in `Composer.tsx` to match backend constraints.

- **Post Editing & Management (frontend-next)**:
  - **Composer Upgrade**: Added `postToEdit` prop to populate form state and switched button to "UPDATE".
  - **Feed Interaction**: Wired up the **Edit** button in `PostFeed` to trigger the edit mode in `DashboardPage`.
  - **State Management**: Lifted `editingPost` state to `DashboardPage` to coordinate `PostFeed` and `Composer`.
  - **Mutation Logic**: Refactored `createPostMutation` into a generic `upsertPostMutation` handling both `POST` and `PATCH` based on the presence of an ID.

- **Business Logic & Constraints (Nestjs_Backend)**:
  - Implemented **`SubscriptionGuard`** to enforce a 10-post monthly limit for `FREE` plan workspaces.
  - Updated `PostsService` to:
    - Increment `currentPostCount` in the workspace upon post creation.
    - Prevent editing posts with a `PUBLISHED` status (returns `ForbiddenException`).
  - Added a **`POST /api/users/upgrade-pro`** endpoint to allow programmatic upgrading of users for testing and future billing integration.
  - Added a **`PATCH /api/workspaces/:id/set-post-count`** endpoint to manually adjust post counts during E2E tests.
- **Frontend Refinement**:
  - Updated `PostFeed.tsx` to include an **Edit button** that is automatically disabled for published posts, preventing invalid state transitions.


- **CI/CD**:
  - Verified that local tests and builds align with successful GitHub Actions runs.

### Fixes & Production Readiness
- **Google OAuth Stability**:
  - Modified `Nestjs_Backend/src/main.ts` to include `trust proxy`, allowing correct HTTPS detection behind Render's proxy.
  - Updated `GoogleStrategy` to sanitize `GOOGLE_CALLBACK_URL` (automatic removal of accidental quotes or whitespace from env vars).
- **Frontend Build Stability**:
  - Consolidated redundant `api.ts` files: removed obsolote `frontend-next/lib/api.ts` and `frontend-next/src/api.ts`.
  - Standardized all frontend imports to use the robust fetch-based client at `@/src/lib/api`.
  - Resolved "Export api doesn't exist" build errors on Vercel.
  - **Syntax & Type Fixes**:
    - Fixed a missing closing `</div>` in `Analytics.tsx` causing Turbopack parsing failures.
    - Added missing `MessageCircle`, `RefreshCw`, and `AlertTriangle` icon imports in `Composer.tsx` and `PostFeed.tsx`.
    - Resolved `errorMessage` type error in `PostFeed.tsx` by updating the `Post` interface.
    - Cleaned up misplaced `format` imports in `ConnectAccounts.tsx` and `MediaGallery.tsx`.

- **UI/UX Visual Identity (frontend-next)**:
  - **Color Palette Update**: Transitioned the dashboard from yellow accents to a refined **Blue (#3C48F5), Black, and White** Neubrutalist theme.
  - **Tailwind Config**: Updated `tailwind.config.ts` to set `#3C48F5` as the primary brand color.
  - **Component Refinement**: Applied the new theme across `Analytics.tsx`, `ConnectAccounts.tsx`, `MediaGallery.tsx`, and `EasyAI.tsx`.
  - Navigation: Added a **Home icon button** in the dashboard header for quick return to the landing page.
  - AI Experience: Implemented a **Typewriter effect** for Steve AI responses and silenced all feedback notifications (toasts).

- **Theming & Performance (frontend-next)**:
  - **Default Theme**: Set **Dark Mode (Black Theme)** as the default for the entire application (Landing Page & Dashboard).
  - **Loader Unification**: 
    - Removed the redundant `Preloader` splash screen.
    - Standardized all page transitions and data-fetching states to use the unified **`SpinningLoader`**.
    - Replaced manual `Loader2` or custom spinners in `Dashboard`, `AuthCallback`, `ConnectAccounts`, `Analytics`, `Engagement`, `Team`, `MediaGallery`, and `Workspaces` with the global component.
  - **Visual Consistency**: Corrected secondary accents and backgrounds to match the #3C48F5/Black/White design system.
  - **Internationalization (i18n)**:
    - Implemented automatic **Device Language Detection** (defaults to 'fr' for French locales, else 'en').
    - Persisted language preference to `localStorage`.
    - Unified language state across Landing Page and Dashboard (Sidebar menu items now translate dynamically).

- **Module 3: Creator Fund Program (Full-Stack)**:
  - **Database (Prisma)**: Added `CreatorApplication` model and `ApplicationStatus` enum.
  - **Backend (NestJS)**:
    - Implemented `CreatorFundModule`, `CreatorFundService`, and `CreatorFundController`.
    - Added endpoints: `POST /creator-fund/apply`, `GET /creator-fund/my-application`, `GET /creator-fund/applications` (Admin), and `PATCH /creator-fund/:id/status` (Admin).
    - Integrated with `JwtAuthGuard` and `PrismaService`.
  - **Frontend (Next.js)**:
    - Created a production-ready **Creator Fund Landing & Application Page** (`/creator-fund`).
    - Implemented Neubrutalist design on a **Black Background**.
    - Connected application form to real backend API with validation and loading states.
    - Added program status tracking for applied users.
    - Updated `Footer` with a direct link to the program.

- **Community & Roadmap (Full-Stack)**:
  - **Database (Prisma)**: Added `CommunityFeedback` and `FeedbackUpvote` models. Implemented unique voting constraints.
  - **Backend (NestJS)**:
    - Created `CommunityModule` with Service and Controller.
    - Added endpoints: `GET /community/roadmap` (Public), `POST /community/feedback` (Protected), `POST /community/feedback/:id/upvote` (Protected), and `PATCH /community/feedback/:id/status` (Admin).
    - Implemented logic for upvote toggling and author tracking.
  - **Frontend (Next.js)**:
    - Fully connected the Community page to the backend API.
    - Replaced mock data with live roadmap fetching.
    - Implemented real feedback submission and upvote functionality.
    - Added loading states and empty library indicators for the roadmap.

- **Admin Dashboard & User Access Control (Full-Stack)**:
  - **Backend (NestJS)**:
    - Added `setPlan` method to `UsersService` for manual plan overrides.
    - Implemented `PATCH /users/:id/plan` endpoint in `UsersController`.
    - Secured admin endpoints using `RolesGuard` and `@Roles('ADMIN')` decorator.
  - **Frontend (Next.js)**:
    - Created an **Admin Control Center** (`/admin/users`) for user management.
    - Implemented real-time plan updates (FREE, STARTER, PRO, BUSINESS) with immediate feedback.
    - Added search, filtering, and database synchronization features.
    - Removed decorative icons from `BenefitCard` in the Creator Fund page for a cleaner look.
    - Ensured consistent Neubrutalist design on a black background for all admin pages.


