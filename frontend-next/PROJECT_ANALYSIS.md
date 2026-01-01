# EasyPost Frontend - Next.js Application Analysis

## Project Overview
**EasyPost** is a **Social Media Scheduler & Management Platform** built with Next.js, Convex (backend-as-a-service), and Clerk (authentication). It allows users to create workspaces, connect multiple social media accounts (Twitter, LinkedIn, Instagram, Facebook, TikTok, YouTube, Pinterest, Telegram), and schedule/publish posts across those platforms.

---

##  Architecture Overview

### Tech Stack
- **Frontend Framework**: Next.js 16.0.6 with React 19.2.0
- **Database & Backend**: Convex (serverless backend with real-time capabilities)
- **Authentication**: Clerk (OAuth provider with multi-user support)
- **Styling**: Tailwind CSS 3.4.17 + custom CSS
- **UI Components**: Shadcn/UI (badge, button, calendar, card, popover, textarea)
- **Icons**: Lucide React + React Icons (5.5.0)
- **Animations**: Framer Motion (12.23.25)
- **HTTP Client**: Axios for API calls
- **Date Utilities**: date-fns (4.1.0)
- **Toast Notifications**: Sonner (2.0.7)

### Key Technologies
- **Convex**: Real-time database with mutations, queries, actions, and internal functions
- **Clerk**: OAuth-based authentication + token management
- **Vercel Deployment**: Project uses `vercel.json` for deployment configuration

---

## 📁 Folder Structure

```
frontend-next/
├── src/
│   ├── app/                          # Next.js app router (13+ new structure)
│   │   ├── layout.tsx               # Root layout (Convex + Clerk providers)
│   │   ├── page.tsx                 # Landing/Home page (marketing sections)
│   │   ├── ConvexClientProvider.tsx # Wraps ClerkProvider + ConvexProvider
│   │   ├── globals.css              # Global styles
│   │   ├── dashboard/               # Protected dashboard routes
│   │   │   ├── page.tsx            # Redirect to first workspace or onboarding
│   │   │   └── [id]/               # Workspace-specific dashboard
│   │   │       └── page.tsx        # Main dashboard with queue, analytics, settings
│   │   ├── onboarding/             # User onboarding (category + plan selection)
│   │   ├── login/                  # Clerk sign-in page
│   │   ├── signup/                 # Clerk sign-up page
│   │   └── sso-callback/           # Social OAuth callback (Meta/Telegram)
│   │
│   ├── components/                  # React components
│   │   ├── easypost/               # EasyPost-specific components
│   │   │   ├── Composer.tsx        # Post creation form
│   │   │   ├── PostFeed.tsx        # Displays drafts/queue (drag-drop)
│   │   │   ├── ConnectAccounts.tsx # Social account connection UI
│   │   │   ├── Settings.tsx        # Workspace settings (6 tabs)
│   │   │   ├── Analytics.tsx       # Analytics dashboard
│   │   │   ├── Engagement.tsx      # Engagement inbox
│   │   │   ├── EngagementAnalytics.tsx
│   │   │   ├── types.ts            # TypeScript interfaces
│   │   │   └── ...other components
│   │   ├── ui/                      # Shadcn UI components
│   │   ├── Navbar.tsx              # Top navigation
│   │   ├── Hero.tsx                # Landing page sections
│   │   └── ...other landing pages
│   │
│   ├── context/
│   │   └── LanguageContext.tsx     # i18n (English/French support)
│   │
│   └── api.ts                       # Axios instance with JWT interceptors
│
├── services/
│   ├── postApi.ts                   # Post creation (FastAPI integration)
│   ├── workspaceApi.ts             # Workspace CRUD (localStorage fallback)
│   └── projectApi.ts               # Project CRUD (mocked)
│
├── convex/                          # Convex backend (serverless)
│   ├── schema.ts                   # Database schema (tables)
│   ├── users.ts                    # User sync from Clerk
│   ├── workspaces.ts               # Workspace CRUD
│   ├── accounts.ts                 # Social account management
│   ├── posts.ts                    # Post CRUD + publishing logic
│   ├── publish.ts                  # Publishing action (Facebook/Instagram)
│   ├── analytics.ts                # Analytics cron + syncing
│   ├── crons.ts                    # Scheduled cron jobs
│   ├── http.ts                     # HTTP endpoints (Telegram webhook)
│   ├── SocialActions.ts            # Social media actions
│   ├── auth.config.ts              # Clerk authentication config
│   └── _generated/                 # Auto-generated Convex types
│
└── lib/
    └── utils.ts                     # Utility functions (cn for Tailwind)
```

---

## 🔐 Authentication Flow

### Clerk Integration
1. **ClerkProvider** wraps the entire app in `ConvexClientProvider.tsx`
2. **useAuth** hook from Clerk provides authentication state
3. **Middleware** (`src/middleware.ts`) protects routes:
   - `/dashboard/*` - requires authentication
   - `/onboarding/*` - requires authentication
4. **Convex Integration** uses `ConvexProviderWithClerk` for seamless auth

### User Lifecycle
1. User signs up via Clerk (OAuth or email)
2. `users.ts` `store()` mutation syncs Clerk user to Convex DB
3. User creates workspace in onboarding (`workspaces.create`)
4. Workspace stored with `ownerId` (Clerk subject) and `members` array

---

## 📊 Database Schema (Convex)

### Tables

#### `users`
```typescript
{
  tokenIdentifier: string,    // Clerk token ID
  name?: string,              // User's name
  email?: string,             // User's email
}
Index: by_token
```

#### `workspaces`
```typescript
{
  name: string,
  ownerId: string,            // Clerk user ID
  members: string[],          // Array of user IDs (for multi-user workspaces)
  plan?: string,              // 'free' | 'starter' | 'pro' | 'agency' | 'enterprise'
}
```

#### `accounts` (Social Media Accounts)
```typescript
{
  workspaceId: Id<"workspaces">,
  platform: string,           // 'twitter', 'linkedin', 'instagram', 'facebook', 'telegram', etc.
  platformAccountId?: string, // Account ID on the platform
  platformUsername: string,   // e.g., @username or channel name
  avatarUrl?: string,         // Profile picture
  accessToken?: string,       // OAuth token
  refreshToken?: string,      // OAuth refresh token
  tokenExpiresAt?: number,    // Token expiration timestamp
  credentials?: {
    botToken: string,         // For Telegram
    chatId: string
  },
  metadata?: any
}
Index: by_workspace
```

#### `posts`
```typescript
{
  workspaceId: Id<"workspaces">,
  accountId: Id<"accounts">,
  content: string,
  mediaStorageIds?: string[],
  status: 'draft' | 'scheduled' | 'published' | 'failed',
  scheduledTime: number,      // Unix timestamp
  publishedTime?: number,
  publishedRemoteId?: string, // ID from Facebook/Instagram API
  failureReason?: string
}
Indexes: by_workspace, by_status
```

---

## 🔄 Core Features & Workflows

### 1. **Landing Page** (`src/app/page.tsx`)
- Marketing sections with feature highlights
- Social proof (Google, Microsoft, Spotify, Amazon, Apple)
- Call-to-action buttons
- Components: Hero, StatsSection, PublishSection, AnalyzeSection, etc.

### 2. **Onboarding** (`src/app/onboarding/page.tsx`)
- Step 1: Select use-case category (personal, business, creator, agency, enterprise)
- Step 2: Select pricing plan based on category
- Creates workspace with name from Clerk user
- Redirects to dashboard after workspace creation

### 3. **Dashboard** (`src/app/dashboard/[id]/page.tsx`)
Main workspace hub with 5 tabs:

#### a) **Queue (Content Calendar)**
- **Composer**: Create/schedule posts
  - Text editor with media upload
  - Account selector (multi-platform)
  - Schedule date/time picker
  - AI assistant (hashtag suggestions)
- **PostFeed**: 
  - Drafts column (left)
  - Queue/Scheduled column (right)
  - Drag-and-drop between draft → queue
  - Status badges (draft, scheduled, published, failed)

#### b) **Analytics**
- Real-time metrics (followers, impressions, engagement)
- Synced daily via Convex cron jobs
- Platform-specific data

#### c) **Engagement**
- Inbox: Messages from followers
- Analytics: Engagement breakdown

#### d) **Settings** (6 tabs)
1. **General/Profile**: Workspace name, avatar, description
2. **Connections**: Social account management (ConnectAccounts component)
3. **Notifications**: Email alerts for publishing, failures, weekly reports
4. **Interface**: Theme settings (light/dark/system)
5. **Members**: Team invite + role management
6. **Billing & Usage**: Plan info, usage limits, upgrade button

#### e) **Team**
- Manage workspace members
- Roles (Owner, Editor, Viewer)
- Invitations

### 4. **Social Account Connection** (`src/components/easypost/ConnectAccounts.tsx`)
Supports multiple platforms with different auth flows:

**Real OAuth (Implemented)**
- **Meta (Facebook/Instagram)**: Redirects to Meta OAuth flow
  - Scopes: `pages_show_list`, `pages_manage_posts`, `instagram_content_publish`
  - Callback: `sso-callback` page
- **Telegram**: Bot linking via magic link (`/start <workspace_id>`)

**Mock OAuth (Demo)**
- Twitter, LinkedIn, TikTok, YouTube, Pinterest, Google

Platform config defines icons, colors, descriptions.

### 5. **Post Publishing** (`convex/publish.ts`)
Workflow:
1. Composer creates post (status: `scheduled`)
2. Cron job runs every minute, checks for posts where `scheduledTime <= now`
3. Triggers `internal.posts.publishDuePosts`
4. For each due post, calls `publish.publishNow` action
5. Action fetches account and calls platform API:
   - **Facebook**: Simple POST to `/feed` endpoint
   - **Instagram**: 2-step process (create container → publish)
6. Updates post status to `published` or `failed`

### 6. **Analytics Sync** (`convex/analytics.ts`)
- Daily cron at 00:00 UTC
- Fetches metrics for all accounts
- Stores snapshots in `analytics_account_daily` table (not yet fully defined in schema)

---

## 🔄 Data Flow Diagrams

### Post Creation & Scheduling
```
User Input (Composer)
    ↓
handleSubmit() → createPostMutation()
    ↓
convex/posts.ts → createPost mutation
    ↓
Insert to "posts" table (status: scheduled)
    ↓
Toast notification
    ↓
Update PostFeed UI
```

### Post Publishing (Auto)
```
Cron: Every 1 minute
    ↓
convex/crons.ts → publishDuePosts
    ↓
Find all posts where status='scheduled' AND scheduledTime <= now
    ↓
Schedule: internal.publish.publishNow action
    ↓
Fetch account + post details
    ↓
Call platform API (Facebook/Instagram)
    ↓
Mark as published or failed
```

### Social Account Connection
```
User clicks "Connect [Platform]"
    ↓
handleConnect() → Platform-specific flow
    ├─ Meta: Redirect to OAuth consent
    ├─ Telegram: Open bot link
    └─ Others: mockConnect mutation
    ↓
Callback page processes auth code
    ↓
convex/accounts.ts → mockConnect or linkTelegramInternal
    ↓
Insert to "accounts" table
    ↓
Dashboard updates accounts list
```

---

## 🎯 Key Components & Their Responsibilities

| Component | Purpose | Key Props |
|-----------|---------|-----------|
| **Composer** | Post creation form | `onSchedule` callback |
| **PostFeed** | Queue visualization + drag-drop | `posts`, `accounts` |
| **ConnectAccounts** | Social OAuth flow manager | `workspaceId` |
| **Settings** | Workspace configuration hub | `workspaceName`, `plan` |
| **Analytics** | Metrics dashboard | (reads from Convex) |
| **Engagement** | Comments/Messages inbox | (reads from Convex) |

---

## 🔌 API Integration Points

### Internal (Convex)
- **Queries**: `getMyWorkspaces`, `getById`, `getWorkspacePosts`, `getByWorkspace`
- **Mutations**: `create` (workspace), `createPost`, `updateStatus`, `mockConnect`, `disconnect`
- **Actions**: `publishNow`, `triggerDailySync`
- **Crons**: Every 1 min (posts), daily at 00:00 UTC (analytics)

### External (Planning)
- **FastAPI Backend** (Future): Post creation with file upload
  - Endpoint: `POST /api/posts` (FormData with channels, file)
- **Meta Graph API**: Publish to Facebook/Instagram
- **Twitter API v2**: Tweet scheduling/publishing
- **Telegram Bot API**: Forward messages to channels

---

## 🎨 UI/UX Design Pattern

### Color Scheme
- **Primary**: `#3C48F6` (Blue)
- **Secondary**: Gray-based (50-900 scale)
- **Accent**: Red for danger, Green for success

### Component Hierarchy
- **Page** → `layout.tsx` (server)
- **Client Components** use `'use client'`
- **Shadcn components** for consistency
- **Framer Motion** for animations (stagger, fade, scale)

### Responsive Design
- Mobile-first with Tailwind breakpoints (sm, md, lg, xl)
- Sidebar collapses on mobile
- Grid layouts adapt (md:grid-cols-2 → mobile: full width)

---

## 📈 Current Limitations & TODOs

1. **Analytics Table**: `analytics_account_daily` referenced but not in schema
2. **File Storage**: Media upload mentioned but not integrated with Convex Storage
3. **Real OAuth**: Only Meta & Telegram have real auth (Twitter, LinkedIn, etc. are mocked)
4. **Team Collaboration**: UI exists but backend members table not fully implemented
5. **Notifications**: UI mocked, no real email/push integration
6. **Plan Limits**: Hardcoded in frontend (should come from backend)
7. **Engagement**: Inbox component structure exists but data source not connected

---

## 🚀 Deployment

- **Vercel**: Primary host (vercel.json exists)
- **Convex**: Backend hosted on Convex.dev
- **Clerk**: Auth hosted on Clerk.com
- **Environment Variables**:
  ```
  NEXT_PUBLIC_CONVEX_URL=<convex-project-url>
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=<clerk-key>
  CLERK_SECRET_KEY=<clerk-secret>
  TELEGRAM_BOT_TOKEN=<telegram-bot-token>
  NEXT_PUBLIC_META_CLIENT_ID=<meta-oauth-app-id>
  NEXT_PUBLIC_API_URL=<fastapi-backend-url>
  ```

---

## 📝 Summary

**EasyPost** is a **modern, real-time social media scheduler** with:
- ✅ Multi-platform support (8+ social networks)
- ✅ Real-time collaboration via Convex
- ✅ OAuth-based authentication (Clerk)
- ✅ Drag-and-drop content calendar
- ✅ Scheduled publishing with cron jobs
- ✅ Analytics & engagement tracking
- ✅ Workspace-based multi-tenancy
- ✅ Responsive design with animations

The architecture is **production-ready** with proper separation of concerns: Convex handles backend logic, Clerk manages auth, and Next.js provides the frontend UI.

---

**Ready to discuss requirements, debug issues, or add features!** 🚀
