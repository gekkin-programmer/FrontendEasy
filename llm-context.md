# Single Source of Truth — Contexte du projet EasyPostV2

Ce document unique sert de référence complète pour qu'un autre modèle LLM ou un développeur puisse reprendre le projet sans perte d'information. Il couvre l'architecture, les flux critiques, la structure des modules, les conventions, l'état actuel et les contrats full-stack.

## High-Level Overview

- **Objectif du SaaS** : EasyPostV2 est une plateforme SaaS orientée gestion de contenu social / productivité d'équipe (posts, calendriers, analytics, intégrations de comptes sociaux, AI-assistance, media enhancement, publication et calendaring). L'application inclut interfaces web (frontend, frontend-next) et backends Java et Node/NestJS pour API, traitement et orchestration.

- **Stack technique exacte** :
  - **Frontend** : TypeScript + React (Vite) dans `frontend/` et une version Next.js/TypeScript dans `frontend-next/` (app router, TailwindCSS, PostCSS).
  - **Backend** : Deux backends visibles :
    - `backend/` (Java Spring Boot - Maven). Fichiers : `backend/pom.xml`, `backend/src/main/java/.../BackendApplication.java`.
    - `Nestjs_Backend/` (NestJS + TypeScript, Prisma). Contient `package.json`, `src/`, `prisma/schema.prisma`, migrations et seed.
  - **DB & ORM** : Prisma (dans `Nestjs_Backend/prisma`), migrations SQL versionnées (dossier `migrations/`).
  - **Auth & 3rd-party** : OAuth Google, providers pour réseaux sociaux, Cloudinary pour media, email provider (invite.hbs), intégrations sociales (Facebook, Instagram, Twitter, TikTok, YouTube, LinkedIn, WhatsApp).
  - **Dev infra** : scripts `mvnw`, `mvnw.cmd`, Node package files (`package.json`), Vite, TailwindCSS, PostCSS, vercel config pour deployments.

- **Architecture globale** :
  - Frontends (SPA Vite + Next.js) consomment APIs exposées par le backend NestJS (API principale) et/ou Java backend pour tâches spécifiques.
  - NestJS gère la majorité des modules métiers : auth, posts, workspace, users, social-accounts, ai, media, analytics, notifications, payments, teams, tasks, campaigns, calendrier, labels, tags.
  - Prisma comme couche d'accès DB pour NestJS; migrations versionnées dans `prisma/migrations`.
  - Background workers (ex: social sync) via processors/workers (présence de `social-sync.processor.ts`) pour tâches asynchrones.

## Core Logic & Flows

### 1) Authentification
   - Flux principal : Inscription / login / sessions via `Nestjs_Backend/src/modules/auth`.
   - Stratégies supportées :
     - JWT (`jwt.strategy.ts`)
     - Google OAuth (`google.strategy.ts`)
     - Phone/OTP (`phone.strategy.ts`)
   - DTOs d'authentification dans `dto/` (login, register, otp, refresh-token, google-auth, phone-login).
   - Guards : `jwt-auth.guard.ts`, `google-auth.guard.ts` pour protéger routes. Décorateurs utilitaires : `current-user.decorator.ts`, `current-workspace.decorator.ts`, `public.decorator.ts`.

### 2) API Requests & Validation
   - Pattern NestJS standard : contrôleurs définissent routes (ex: `posts.controller.ts`, `users.controller.ts`) → services métiers → Prisma pour persistence.
   - DTOs pour input validation et transformation : `create-post.dto.ts`, `update-user.dto.ts`, etc. Chaque module expose DTOs d'entrée et de sortie.
   - Erreurs : exceptions personnalisées (ex: `token-expired.exception.ts`) et gestion via filters/handler global Nest exception handling.
   - Throttling & rate limiting via guards (`throttle.guard.ts`).

### 3) Base de données & Modélisation
   - Prisma schema : `Nestjs_Backend/prisma/schema.prisma` définit modèles (User, Workspace, Post, Media, Comment, SocialAccount, Notification, etc.).
   - Migrations versionnées : `/migrations/` contient migrations SQL datées (`20251229232707_easy_post`, `20260102083552_fix_schema_errors`, etc.).
   - Seed : `prisma/seed.ts` pour données initiales en dev.

### 4) Traitement AI & Media
   - Module AI : `src/modules/ai/` avec service AI, callbacks pour token-usage, outils (`easy-post-tools.ts`). Intégration probable avec provider LLM externe (API keys en env).
   - Media enhancement : `media-enhancement.service.ts` et `cloudinary` providers pour upload/transformations.

### 5) Publication & Scheduler
   - Posts publishing orchestré dans `posts/publishing/publisher.service.ts` et scheduler dans `posts/scheduler/`.
   - Workers / Cron jobs contrôlent publication programmée.
   - Intégration avec réseaux sociaux pour posting distribué.

### 6) Synchronisation sociale
   - Social accounts : intégrations multi-plateformes dans `modules/social-accounts/`.
   - Sync processor : `social-sync.processor.ts` orchestre les syncs de contenu depuis les réseaux.
   - Stratégies de connexion OAuth par réseau (Facebook, TikTok, LinkedIn, YouTube).

## Module Breakdown

### `Nestjs_Backend/src/` : Cœur de l'API REST moderne
- **`main.ts`** : bootstrap de l'app NestJS (point d'entrée, configuration globale).
- **`app.module.ts`** : composition des modules (imports tous les modules métiers).
- **`app.controller.ts` / `app.service.ts`** : endpoints root et health checks.
- **`common/`** : logique partagée
  - `decorators/` : `current-user.decorator.ts`, `current-workspace.decorator.ts`, `public.decorator.ts`, `api-paginated-response.decorator.ts`, `permissions.decorator.ts`.
  - `guards/` : `jwt-auth.guard.ts`, `google-auth.guard.ts`, `roles.guard.ts`, `subscription.guard.ts`, `throttle.guard.ts`, `workspace.guard.ts`.
  - `providers/` : `cloudinary.provider.ts`, `email.module.ts` et `email.service.ts`, `phone.util.ts`.
  - `exceptions/` : `token-expired.exception.ts`.
  - `enums/` : types énumérés centralisés (account-type, approval-status, campaign-status, etc.).
- **`modules/auth/`** : authentification complète
  - `auth.controller.ts` : endpoints `/auth/*`
  - `auth.service.ts` : logique métier
  - `strategies/` : `jwt.strategy.ts`, `google.strategy.ts`, `phone.strategy.ts`
  - `guards/`, `interfaces/`, `serializers/`
  - `dto/` : login, register, otp, refresh-token, google-auth
- **`modules/posts/`** : gestion des posts
  - `posts.controller.ts` : endpoints `/posts`
  - `posts.service.ts` : logique métier
  - `publishing/publisher.service.ts` : orchestration de publication multi-réseau
  - `scheduler/scheduler.controller.ts` et `scheduler.service.ts` : gestion de la programmation
  - `dto/` : `create-post.dto.ts`, `update-post.dto.ts`, `schedule-post.dto.ts`, `post-response.dto.ts`
- **`modules/social-accounts/`** : intégration multi-plateformes
  - `social-accounts.controller.ts` : endpoints `/social-accounts`
  - `social-accounts.service.ts` : logique métier
  - `platforms/` : `facebook.service.ts`, `instagram.service.ts`, `twitter.service.ts`, `tiktok.service.ts`, etc.
  - `strategies/` : `facebook-connect.strategy.ts`, `linkedin-connect.strategy.ts`, etc.
  - `guards/` : `facebook-connect.guard.ts`, `linkedin-connect.guard.ts`, etc.
  - `workers/social-sync.processor.ts` : traitement asynchrone de sync
  - `dto/` : `connect-account.dto.ts`, `sync-account.dto.ts`, `update-account.dto.ts`
- **`modules/ai/`** : logique AI
  - `ai.controller.ts` : endpoints `/ai`
  - `ai.service.ts` : appels API LLM, gestion de contexte
  - `callbacks/token-usage.handler.ts` : tracking consommation tokens
  - `tools/easy-post-tools.ts` : outils spécifiques aux posts/réseaux
  - `dto/` : `ai-request.dto.ts`, `feedback.dto.ts`, `test-ai.dto.ts`
- **`modules/media/`** : gestion des médias
  - `media.controller.ts` : endpoints `/media`
  - `media.service.ts` : logique métier
  - `media-enhancement.service.ts` : transformation / enhancement
  - Intégration Cloudinary via providers
- **`modules/workspaces/`** : espaces de travail collaboratifs
  - `workspaces.controller.ts` : endpoints `/workspaces`
  - `workspaces.service.ts` : logique métier
  - `members/` : `members.controller.ts`, `members.service.ts` pour gestion équipes
  - `chat/` : `chat.controller.ts`, `chat.service.ts` pour communication intra-workspace
  - `dto/` : `create-workspaces.dto.ts`, `update-workspace.dto.ts`, invite, update-role
- **`modules/users/`** : profils utilisateurs
  - `users.controller.ts`, `users.service.ts`
  - `dto/` : `create-user.dto.ts`, `update-user.dto.ts`, `change-password.dto.ts`, `user-response.dto.ts`
- **`modules/notifications/`**, **`modules/teams/`**, **`modules/tasks/`** : logique collaborative
- **`modules/analytics/`** : analytics & reports
- **`modules/campaigns/`** : gestion des campagnes
- **`modules/comments/`**, **`modules/labels/`**, **`modules/tags/`** : entités de support
- **`modules/streams/`**, **`modules/engagement/`** : flux et engagement
- **`modules/subscrption/`**, **`modules/payments/`** : facturation & paiements
- **`prisma/`** : module d'injection Prisma
  - `prisma.module.ts` : déclaration du module
  - `prisma.service.ts` : wrapper de Prisma client
- **`lib/`** : utilitaires
  - `prisma.ts` : configuration de connexion DB
  - `api.ts` : helpers API

### `frontend/` (Vite + React) : SPA Marketing/App
- **`src/main.tsx`** : point d'entrée Vite React.
- **`src/Layouts/MainLayout.tsx`** : layout principal.
- **`src/pages/`** : pages (HomePage, LoginPage, SignupPage, PricingPage, ForgotPasswordPage, NotFoundPage).
- **`src/components/`** : composants réutilisables (Hero, CTA, Footer, Navbar, Features, sections marketing).
- **`src/context/LanguageContext.tsx`** : gestion du langage (i18n).
- **`src/api.ts`** : wrapper fetch pour appels API.
- **Configs** : `vite.config.js`, `tailwind.config.js`, `postcss.config.js`, `package.json`.

### `frontend-next/` (Next.js App Router) : Dashboard Modernes
- **`src/app/`** : structure d'app Next.js (pages, layouts)
  - `page.tsx` : homepage
  - `app/login/page.tsx`, `signup/page.tsx`, `onboarding/page.tsx`
  - `app/dashboard/page.tsx` : dashboard principal
  - `app/dashboard/[id]/page.tsx` : détails workspace
  - `app/dashboard/[id]/settings/page.tsx`, `app/dashboard/settings/page.tsx` : settings
  - `app/dashboard/projects/page.tsx`, `app/dashboard/analytics/page.tsx` : modules métiers
  - `app/community/page.tsx` : section communauté
  - `app/auth/callback/page.tsx` : callback OAuth
  - `app/legal/` : pages légales (privacy, terms, data-deletion)
  - `layout.tsx`, `loading.tsx` : layouts globaux
- **`src/components/easypost/`** : composants dashboard spécifiques
  - `Composer.tsx` : création de posts
  - `PostFeed.tsx` : affichage des posts
  - `Analytics.tsx`, `EngagementAnalytics.tsx` : analytics
  - `ConnectAccounts.tsx` : connexion réseaux sociaux
  - `Sidebar.tsx`, `MobileNav.tsx`, `BottomNav.tsx` : navigation
  - `Settings.tsx`, `Team.tsx` : gestion workspace
  - `EasyAI.tsx`, `VoiceAiButton.tsx` : intégration AI
  - `MediaGallery.tsx`, `ConversationThread.tsx` : contenu
  - `types.ts` : types spécifiques composants
- **`src/components/`** : composants génériques et marketing
- **`src/context/LanguageContext.tsx`** : i18n
- **`src/data/resources.ts`** : données statiques
- **`src/dashboard/layout.tsx`** : layout dashboard
- **`src/lib/`** : utilitaires
  - `api.ts` : wrapper fetch / configuration API client
  - `utils.ts` : helpers génériques
- **`services/`** : clients API abstraits
  - `aiApi.ts` : client pour endpoints AI
  - `postApi.ts` : client pour endpoints Posts
  - `workspaceApi.ts` : client pour endpoints Workspaces
  - `projectApi.ts` : client pour endpoints Projects
- **`src/providers/query-provider.tsx`** : React Query provider (gestion cache/requêtes)
- **Configs** : `next.config.ts`, `tailwind.config.ts`, `tsconfig.json`, `eslint.config.mjs`, `postcss.config.mjs`, `package.json`, `pnpm-lock.yaml`.

### `backend/` (Java Spring Boot)
- **`src/main/java/com/easypost/backend/BackendApplication.java`** : application Spring Boot principale.
- **`pom.xml`** : dépendances Maven.
- **Status** : À clarifier — rôle et intégration avec NestJS Backend à déterminer.

### Scripts & Configs Racine
- **`package.json`** (Nestjs_Backend), **`pom.xml`** (backend) : dépendances et scripts.
- **Tailwind & PostCSS** : configurations CSS pour frontends (utility-first).

## Conventions & Patterns

- **Architecture modulaire NestJS** : modules isolés, services métier, controllers pour routes.
- **DTO-first validation** : chaque endpoint a un DTO d'entrée et de sortie définis explicitement.
- **Guards & Decorators** : utilisation systématique des guards pour rôles (roles.guard), permissions (permission.guard), throttling (throttle.guard), et current-user/workspace injection.
- **Dependency Injection Nest** : Cloudinary, Email, Prisma exposés comme providers et injectés via constructeurs.
- **Error handling** : exceptions Nest (`throw new HttpException`, `throw new UnauthorizedException`, etc.), exceptions custom (token-expired).
- **Background processing** : workers et processors (social-sync.processor.ts) pour tâches asynchrones et événements.
- **Database migrations** : Prisma migrations versionnées, seed script pour dev.
- **TypeScript strict** : typage complet, pas de `any` encouragé.
- **API response normalization** : DTOs de réponse standardisés pour cohérence client.

## Visual Identity & Design System

- **Default Theme**: **Dark Mode (Black Theme)** by default across Landing Page and Dashboard.
- **Primary Colors**: 
  - **Brand Blue**: `#3C48F5` (used for primary actions, badges, and accents).
  - **Black**: `#000000` (used for backgrounds, borders, text, and heavy shadows).
  - **White**: `#FFFFFF` (high-contrast elements and text in dark mode).
- **Style**: **Neubrutalism** — characterized by thick black borders (`border-4`), hard shadows (`shadow-[8px_8px_0px_0px_#000]`), and high-contrast typography.
- **Typography**: JetBrains Mono (default for both sans and mono contexts to maintain a tech-focused, readable aesthetic).
- **Loading UX**: Unified `SpinningLoader` component used for all page transitions and async states.

## Current State & Roadmap

### Ce qui est terminé (visible dans l'arborescence)
- Structure complète du backend NestJS avec tous les modules métiers (auth, posts, workspaces, social-accounts, ai, media, analytics, notifications, payments, teams, tasks, campaigns, calendrier).
- Prisma schema complet avec modélisation des entités et migrations.
- Deux frontends fonctionnels (Vite et Next.js) avec pages et composants.
- Intégrations de providers (Cloudinary, email) et stratégies OAuth complètes.
- Background workers pour sync social.
- **Unit Testing**: Tests unitaires pour `AuthService`, `WorkspacesService`, `PostsService`, `SchedulerService` et `MediaService` couvrant les flux MVP.
- **Frontend Testing**: Suite de tests Jest/React Testing Library pour les pages critiques (`Signup`, `Login`).
- **Robust Integration**: API client configuré avec `credentials: 'include'` pour support des cookies sécurisés et gestion fluide des redirections OAuth.
- **Scheduling Logic**: `SchedulerService` capable de gérer la planification, le décalage et l'annulation des posts avec validation de date.
- **Media Engine**: Gestion réelle de la bibliothèque média avec Cloudinary, calcul de l'usage stockage et enforcement des limites de plan (100MB FREE).

### Ce qui peut être incomplet/à vérifier (priorité haute)
- **Backend Java vs NestJS** : rôle exact du `backend/` Spring Boot. Clarifier si legacy ou microservice complémentaire. **Priorité** : unifier ou documenter explicitement la boundary.
- **Tests E2E**: Pipeline de tests e2e pour le workflow complet (Register -> Create Workspace -> Post).
- **Secrets & Variables d'environnement** : non inclus dans le repo. Documenter et générer `.env.example`.
- **Documentation API** : pas de spec OpenAPI visible. Générer Swagger pour clients.

### Prochaines étapes techniques prioritaires
1. Centraliser et documenter variables d'environnement (voir section suivante). Générer `.env.example`.
2. Clarifier l'architecture : rôle du backend Java, API gateway si nécessaire.
3. Exécuter migrations Prisma (`npx prisma migrate dev`) et valider seed.
4. Générer spec OpenAPI/Swagger à partir des controllers NestJS (ex: `@nestjs/swagger`).
5. Augmenter la couverture de tests (unit/e2e) pour les modules restants.
6. Ajouter CI pipeline (GitHub Actions : lint, test, build).
7. Sécuriser endpoints sensibles (audit guards, scopes OAuth, rotation clés).
8. Configurer déploiement (conteneurisation, orchestration si nécessaire).

## Key Context (variables d'environnement & points d'entrée)

### Variables d'environnement (NE PAS INCLURE VALEURS RÉELLES)

**Base de données**
- `DATABASE_URL` — Prisma connection string (PostgreSQL / MySQL / autres)
- `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` (si décomposées)

**Authentication & JWT**
- `JWT_SECRET` — clé secrète pour signer tokens JWT
- `JWT_EXPIRATION` — durée de validité tokens (ex: "7d")
- `REFRESH_TOKEN_SECRET` — clé pour refresh tokens
- `REFRESH_TOKEN_EXPIRATION` — durée (ex: "30d")

**OAuth Providers**
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
- `FACEBOOK_APP_ID`, `FACEBOOK_APP_SECRET`
- `INSTAGRAM_BUSINESS_ACCOUNT_ID`, `INSTAGRAM_ACCESS_TOKEN` (ou OAuth equivalent)
- `TWITTER_API_KEY`, `TWITTER_API_SECRET`, `TWITTER_BEARER_TOKEN`
- `TIKTOK_CLIENT_ID`, `TIKTOK_CLIENT_SECRET`
- `LINKEDIN_CLIENT_ID`, `LINKEDIN_CLIENT_SECRET`
- `YOUTUBE_CLIENT_ID`, `YOUTUBE_CLIENT_SECRET`
- `WHATSAPP_BUSINESS_ACCOUNT_ID`, `WHATSAPP_ACCESS_TOKEN`

**Cloudinary / Media**
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`

**Email / SMTP**
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`
- `SMTP_FROM_EMAIL`, `SMTP_FROM_NAME` (optionnel)

**AI / LLM Providers**
- `OPENAI_API_KEY` (ou autre LLM)
- `AI_PROVIDER_ENDPOINT` (optionnel, si API personnalisée)
- `AI_MODEL_NAME` (ex: "gpt-4", "claude-3-sonnet", etc.)

**Phone/OTP**
- `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER` (si utilisé)

**Paiements (Stripe)**
- `STRIPE_PUBLIC_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`

**Monitoring & Logging**
- `SENTRY_DSN` (error tracking)
- `LOG_LEVEL` (ex: "debug", "info", "error")

**Redis (si utilisé pour workers/cache)**
- `REDIS_URL` — redis://user:pass@host:port/db

**Application**
- `NODE_ENV` — "development", "staging", "production"
- `API_PORT` — port du serveur NestJS (défaut 3000)
- `API_URL` — URL publique de l'API (pour OAuth callbacks, etc.)
- `FRONTEND_URL` — URL du frontend (pour CORS, redirections)
- `FRONTEND_NEXT_URL` — URL du frontend Next (si séparé)

### Points d'entrée (entry points)

**Backend NestJS**
- **Fichier** : [Nestjs_Backend/src/main.ts](Nestjs_Backend/src/main.ts)
- **Commande** : `cd Nestjs_Backend && npm run start` (ou `npm run start:dev` pour watch mode)
- **URL par défaut** : `http://localhost:3000`
- **Port configurable** : via `.env` `API_PORT`

**Frontend Vite**
- **Fichier** : [frontend/src/main.tsx](frontend/src/main.tsx)
- **Commande** : `cd frontend && npm run dev`
- **URL** : `http://localhost:5173` (défaut Vite)
- **Build** : `npm run build`

**Frontend Next.js**
- **Fichier** : [frontend-next/src/app/layout.tsx](frontend-next/src/app/layout.tsx) (entry root layout)
- **Pages** : [frontend-next/src/app](frontend-next/src/app)
- **Commande** : `cd frontend-next && npm run dev`
- **URL** : `http://localhost:3000` (défaut Next)
- **Build** : `npm run build`

**Backend Java (Spring Boot)**
- **Fichier** : [backend/src/main/java/com/easypost/backend/BackendApplication.java](backend/src/main/java/com/easypost/backend/BackendApplication.java)
- **Build** : `cd backend && ./mvnw clean install` (ou `mvnw.cmd` sur Windows)
- **Run** : `./mvnw spring-boot:run`
- **Status** : À clarifier

### Commandes utiles (dev setup)

```bash
# Setup Nestjs_Backend
cd Nestjs_Backend
npm install  # ou pnpm install
npx prisma migrate dev  # applique migrations
ts-node prisma/seed.ts  # seed initial (si script existe)
npm run start:dev  # démarre serveur en watch mode

# Setup frontend-next
cd ../frontend-next
npm install
npm run dev  # démarre dev server

# Setup frontend (Vite)
cd ../frontend
npm install
npm run dev  # démarre dev server
```

## Full-Stack Integration

### 1) Routes API Consommées (contrats visibles)

**Authentication (`/auth`)**
- `POST /auth/register` — inscription utilisateur (DTO: `RegisterDto`)
- `POST /auth/login` — login standard (DTO: `LoginDto`)
- `POST /auth/google` ou `GET /auth/google/callback` — Google OAuth flow
- `POST /auth/refresh` — refresh JWT token (DTO: `RefreshTokenDto`)
- `POST /auth/verify-otp` — vérification OTP (DTO: `VerifyOtpDto`)
- `POST /auth/send-otp` — envoi OTP (DTO: `OtpDto`)

**Users (`/users`)**
- `GET /users/profile` — récupère profil courant
- `PATCH /users/profile` — met à jour profil (DTO: `UpdateUserDto`)
- `POST /users/change-password` — changement mot de passe (DTO: `ChangePasswordDto`)
- `GET /users/:id` — détails utilisateur

**Workspaces (`/workspaces`)**
- `POST /workspaces` — créer workspace (DTO: `CreateWorkspacesDto`)
- `GET /workspaces` — lister workspaces utilisateur
- `GET /workspaces/:id` — détails workspace
- `PATCH /workspaces/:id` — mettre à jour (DTO: `UpdateWorkspaceDto`)
- `POST /workspaces/:id/members/invite` — inviter membre (DTO: `InviteMemberDto`)
- `GET /workspaces/:id/members` — lister membres
- `PATCH /workspaces/:id/members/:memberId/role` — update rôle membre (DTO: `UpdateRoleDto`)

**Posts (`/posts`)**
- `POST /posts` — créer post (DTO: `CreatePostDto`)
- `GET /posts` — lister posts (paginated)
- `GET /posts/:id` — détails post (DTO: `PostResponseDto`)
- `PATCH /posts/:id` — mettre à jour (DTO: `UpdatePostDto`)
- `DELETE /posts/:id` — supprimer
- `POST /posts/:id/publish` — publier immédiatement
- `POST /posts/schedule` — programmer publication (DTO: `SchedulePostDto`)

**Social Accounts (`/social-accounts`)**
- `POST /social-accounts/connect` — connecter réseau social (DTO: `ConnectAccountDto`)
- `GET /social-accounts` — lister comptes connectés
- `POST /social-accounts/sync` — synchroniser données (DTO: `SyncAccountDto`)
- `PATCH /social-accounts/:id` — mettre à jour (DTO: `UpdateAccountDto`)
- `DELETE /social-accounts/:id` — déconnecter

**AI (`/ai`)**
- `POST /ai/generate` — générer contenu AI (DTO: `AiRequestDto`)
- `POST /ai/feedback` — envoyer feedback (DTO: `FeedbackDto`)
- `POST /ai/test` — test API (DTO: `TestAiDto`)

**Media (`/media`)**
- `POST /media/upload` — upload média (multipart/form-data) → utilise Cloudinary
- `GET /media` — lister médias workspace
- `DELETE /media/:id` — supprimer média

**Analytics (`/analytics`)**
- `GET /analytics` — analytics workspace (DTO: `AnalyticsQueryDto`)
- `POST /analytics/reports` — générer rapports (DTO: `ReportRequestDto`)

**Notifications (`/notifications`)**
- `GET /notifications` — lister notifications
- `PATCH /notifications/:id/read` — marquer lue (DTO: `MarkReadDto`)

**Other endpoints** (modules moins critiques)
- `/comments`, `/labels`, `/tags`, `/tasks`, `/teams`, `/campaigns`, `/streams`, `/engagement`, `/content-calendar` — suivent même pattern

### 2) Types/Interfaces partagés (TypeScript)

**Backend DTOs (canonical source)**
- Emplacement : [Nestjs_Backend/src/modules/*/dto/](Nestjs_Backend/src/modules/*/dto/)
- Exemples :
  - [auth/dto/login.dto.ts](Nestjs_Backend/src/modules/auth/dto/login.dto.ts)
  - [posts/dto/create-post.dto.ts](Nestjs_Backend/src/modules/posts/dto/create-post.dto.ts)
  - [users/dto/user-response.dto.ts](Nestjs_Backend/src/modules/users/dto/user-response.dto.ts)
- Ces DTOs servent de **contrat canonical** pour les API responses.

**Frontend Types (clients API)**
- Emplacement principal : [frontend-next/services/](frontend-next/services/)
  - [frontend-next/services/postApi.ts](frontend-next/services/postApi.ts) — types/contrats pour POST endpoints
  - [frontend-next/services/aiApi.ts](frontend-next/services/aiApi.ts) — types pour AI
  - [frontend-next/services/workspaceApi.ts](frontend-next/services/workspaceApi.ts) — types pour workspaces
- Composants-spécifiques : [frontend-next/src/components/easypost/types.ts](frontend-next/src/components/easypost/types.ts)
- Context/App : [frontend-next/src/context/LanguageContext.tsx](frontend-next/src/context/LanguageContext.tsx)

**Synchronisation types recommandée**
- Option 1 : Générer types TypeScript à partir des DTOs via `@nestjs/swagger` + openapi-typescript-codegen.
- Option 2 : Créer package partagé `@easy-post/types` contenant types/interfaces partagées (à exporter de backend et importer dans frontend).
- **Status actuel** : types probablement définis manuellement côté frontend; recommandation est de les synchroniser via générateur.

### 3) Gestion d'état global (Frontend)

**Gestion requêtes & cache**
- **Provider** : [frontend-next/src/providers/query-provider.tsx](frontend-next/src/providers/query-provider.tsx)
- **Technologie** : React Query (ou TanStack Query) pour cache côté client, gestion de l'état des requêtes (loading, error, success).
- **Pattern** : Composants appellent `useQuery(queryKey, fetcher)` pour récupérer data, et `useMutation(mutationFn)` pour créations/updates.
- **Cache invalidation** : après une mutation, invalidation de queries liées pour refetch automatique.

**Global UI State**
- **Context** : [frontend-next/src/context/LanguageContext.tsx](frontend-next/src/context/LanguageContext.tsx) — gestion de la langue.
- **Autres** : hooks locaux (`useState`) ou context Provider pour workspace sélectionné, user courant, etc.
- **Recommandation** : centraliser l'authentification et workspace context en providers globaux.

**API Clients Abstraits**
- [frontend-next/services/postApi.ts](frontend-next/services/postApi.ts) — encapsule fetch POST endpoints.
- [frontend-next/services/workspaceApi.ts](frontend-next/services/workspaceApi.ts) — encapsule fetch workspace endpoints.
- [frontend-next/services/aiApi.ts](frontend-next/services/aiApi.ts) — encapsule fetch AI endpoints.
- Tous utilisent wrapper base : [frontend-next/src/lib/api.ts](frontend-next/src/lib/api.ts) (configuration fetch, auth headers, baseURL).

**Data flow**
1. Composant → appelle service API (`postApi.getPosts()`)
2. Service → utilise wrapper base avec token JWT
3. Backend répond → DTO structure
4. React Query → cache response, met à jour composant
5. Mutation (ex: créer post) → appelle service
6. Service envoie mutation → invalidate query related
7. Query refetch auto → UI mise à jour

### 4) Contrats et recommandations pratiques

**Contrats d'interface**
- Chaque DTO backend a un contrat implicite avec le frontend.
- **Recommandation forte** : générer spec OpenAPI via `@nestjs/swagger` pour documenter automatiquement.
- Implémenter `@ApiResponse`, `@ApiOperation`, `@ApiParam` sur controllers pour auto-doc.

**Synchronisation types**
- Créer package `@easy-post/shared-types` ou générer types via script.
- DTOs backend → types TypeScript pour frontend (ex: `CreatePostDto` → `ICreatePost`).
- Utiliser `ts-to-proto` ou similaire si besoin de gRPC.

**Testing**
- Backend : unit tests (services), e2e tests (controllers). Utiliser Jest + Supertest.
- Frontend : component tests (React Testing Library), e2e (Playwright / Cypress).

**Error Handling**
- Backend : HTTP exceptions normalisées (400, 401, 403, 500) avec body error standardisé.
- Frontend : capturer erreurs via React Query, afficher toast/snackbar, retry logic configuré.

**Rate Limiting & Throttling**
- Backend : `throttle.guard.ts` appliqué sur endpoints sensibles.
- Frontend : gérer optimistically updates, disable buttons lors de pending.

## Appendix — Fichiers & Emplacements Clés (sélection rapide)

**NestJS API**
- [Nestjs_Backend/src/main.ts](Nestjs_Backend/src/main.ts) — bootstrap
- [Nestjs_Backend/src/app.module.ts](Nestjs_Backend/src/app.module.ts) — composition modules
- [Nestjs_Backend/src/modules/auth/auth.controller.ts](Nestjs_Backend/src/modules/auth/auth.controller.ts) — auth endpoints
- [Nestjs_Backend/src/modules/posts/posts.controller.ts](Nestjs_Backend/src/modules/posts/posts.controller.ts) — posts endpoints
- [Nestjs_Backend/src/modules/workspaces/workspaces.controller.ts](Nestjs_Backend/src/modules/workspaces/workspaces.controller.ts) — workspace endpoints
- [Nestjs_Backend/src/modules/ai/ai.controller.ts](Nestjs_Backend/src/modules/ai/ai.controller.ts) — AI endpoints
- [Nestjs_Backend/prisma/schema.prisma](Nestjs_Backend/prisma/schema.prisma) — modèles DB
- [Nestjs_Backend/prisma/seed.ts](Nestjs_Backend/prisma/seed.ts) — seed initial
- [Nestjs_Backend/package.json](Nestjs_Backend/package.json) — dépendances

**Frontend Next.js**
- [frontend-next/src/app/page.tsx](frontend-next/src/app/page.tsx) — homepage
- [frontend-next/src/app/dashboard/page.tsx](frontend-next/src/app/dashboard/page.tsx) — dashboard
- [frontend-next/src/components/easypost/Composer.tsx](frontend-next/src/components/easypost/Composer.tsx) — composition posts
- [frontend-next/src/components/easypost/PostFeed.tsx](frontend-next/src/components/easypost/PostFeed.tsx) — affichage posts
- [frontend-next/services/postApi.ts](frontend-next/services/postApi.ts) — client API posts
- [frontend-next/services/workspaceApi.ts](frontend-next/services/workspaceApi.ts) — client API workspaces
- [frontend-next/src/lib/api.ts](frontend-next/src/lib/api.ts) — wrapper fetch
- [frontend-next/src/providers/query-provider.tsx](frontend-next/src/providers/query-provider.tsx) — React Query provider
- [frontend-next/package.json](frontend-next/package.json) — dépendances

**Frontend Vite**
- [frontend/src/main.tsx](frontend/src/main.tsx) — entry point
- [frontend/src/Layouts/MainLayout.tsx](frontend/src/Layouts/MainLayout.tsx) — layout principal
- [frontend/src/pages/LoginPage.tsx](frontend/src/pages/LoginPage.tsx) — login
- [frontend/src/pages/HomePage.tsx](frontend/src/pages/HomePage.tsx) — homepage
- [frontend/package.json](frontend/package.json) — dépendances

**Backend Java**
- [backend/src/main/java/com/easypost/backend/BackendApplication.java](backend/src/main/java/com/easypost/backend/BackendApplication.java) — Spring Boot app
- [backend/pom.xml](backend/pom.xml) — dépendances Maven

## Conseils pour reprendre le projet (Checklist pour un LLM/dev)

1. **Variables d'environnement** — Créer `.env` local en se basant sur liste précédente. **Ne pas committer les valeurs**. Générer `.env.example` sans secrets.

2. **Database setup**
   ```bash
   cd Nestjs_Backend
   npm install
   npx prisma migrate dev --name init  # applique migrations, crée schema
   ts-node prisma/seed.ts  # (optionnel, si script existe)
   ```

3. **Backend NestJS**
   ```bash
   npm run start:dev  # démarre en watch mode
   # API accessible : http://localhost:3000
   ```

4. **Frontend Next.js**
   ```bash
   cd ../frontend-next
   npm install
   npm run dev  # démarre dev server
   # Vérifier baseURL API dans src/lib/api.ts ou .env.local
   ```

5. **Frontend Vite** (optionnel, si utilisé)
   ```bash
   cd ../frontend
   npm install
   npm run dev
   ```

6. **Tests**
   ```bash
   cd Nestjs_Backend
   npm run test  # unit tests
   npm run test:e2e  # e2e tests
   ```

7. **API Documentation**
   - Ajouter `@nestjs/swagger` si absent
   - Annoter controllers avec `@ApiOperation`, `@ApiResponse`
   - Générer `/api-docs` ou `/swagger`

8. **OAuth Testing** — Vérifier redirect URIs configurées localement pour Google, Facebook, etc.

9. **CI/CD** — Ajouter GitHub Actions ou similaire pour lint, test, build, déploiement.

10. **Architecture clarification** — Déterminer rôle du `backend/` Java. Documenter API gateway si présent.

---

## Derniers commentaires

Ce document est la **Single Source of Truth** pour le projet EasyPostV2. Tout nouveau développeur ou LLM reprenant le projet devrait :

- Commencer par relire cette documentation
- Exécuter la checklist "reprendre le projet"
- Consulter les fichiers clés listés en appendix pour détails spécifiques
- Maintenir ce document à jour lors d'ajouts majeurs (nouveaux modules, changements architecture)

Les points principaux à clarifier/améliorer :
1. Rôle backend Java
2. Spec OpenAPI complète
3. Package de types partagées
4. CI/CD pipeline

Bon développement ! 🚀
