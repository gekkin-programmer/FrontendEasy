# EasyPostV2 - Configuration Complète & Finale

## 🎯 URLs Production

| Service | URL | Status |
|---------|-----|--------|
| **Frontend** | https://easyposttio.vercel.app | ✅ Déployé |
| **Backend API** | https://easypostv2.onrender.com | ✅ Déployé |
| **Database** | Neon PostgreSQL | ✅ Connecté |
| **API Docs** | https://easypostv2.onrender.com/api-docs | ⏳ À configurer |

## 📐 Architecture Production Actuelle

```
┌──────────────────────────────────────────────────────┐
│              UTILISATEURS FINAUX                      │
└───────────────────────┬──────────────────────────────┘
                        │
                        │ HTTPS
                        │
                        ▼
        ┌───────────────────────────────┐
        │   Frontend Next.js            │
        │   https://easyposttio.        │
        │          vercel.app            │
        │                               │
        │   📍 Vercel (Production)      │
        │   - Next.js 14 App Router     │
        │   - TypeScript + Tailwind     │
        │   - React Query               │
        │   - pnpm                      │
        └───────────┬───────────────────┘
                    │
                    │ REST API Calls
                    │ https://easypostv2.onrender.com
                    │
                    ▼
        ┌───────────────────────────────┐
        │   NestJS Backend              │
        │   https://easypostv2.         │
        │          onrender.com         │
        │                               │
        │   📍 Render (Production)      │
        │   - TypeScript + NestJS       │
        │   - Prisma ORM                │
        │   - JWT + OAuth               │
        │   - pnpm                      │
        └───────────┬───────────────────┘
                    │
                    │ Prisma Client (SSL)
                    │
                    ▼
        ┌───────────────────────────────┐
        │   Neon PostgreSQL             │
        │   (Serverless Database)       │
        │                               │
        │   📍 Neon.tech                │
        │   - Auto-scaling              │
        │   - Connection pooling        │
        │   - Branching support         │
        └───────────────────────────────┘

External Services:
├─ Cloudinary (Media CDN)
├─ OpenAI/Claude (AI)
├─ Social APIs (Facebook, Twitter, etc.)
└─ Email Provider (SMTP)
```

## 💻 Configuration Locale (Development)

### Ports Locaux

| Service | Port | URL |
|---------|------|-----|
| **Frontend** | 3001 | http://localhost:3001 |
| **Backend** | 3000 | http://localhost:3000 |

### Package Manager

**pnpm** est utilisé pour tout le projet (pas npm)

```bash
# Installation globale de pnpm (si nécessaire)
npm install -g pnpm

# Vérifier version
pnpm --version
```

## 🚀 Setup Local Development

### 1️⃣ Backend (Nestjs_Backend)

```bash
cd Nestjs_Backend

# Créer fichier .env local
cat > .env << 'EOF'
# =================================
# DATABASE (Neon - Development Branch)
# =================================
DATABASE_URL="postgresql://[user]:[password]@[dev-host]/[database]?sslmode=require"

# =================================
# JWT AUTHENTICATION
# =================================
JWT_SECRET="dev-jwt-secret-changeme-in-production"
JWT_EXPIRATION="7d"
REFRESH_TOKEN_SECRET="dev-refresh-secret-changeme"
REFRESH_TOKEN_EXPIRATION="30d"

# =================================
# APPLICATION
# =================================
NODE_ENV="development"
API_PORT=3000
API_URL="http://localhost:3000"
FRONTEND_URL="http://localhost:3001"
FRONTEND_NEXT_URL="http://localhost:3001"

# =================================
# CORS ORIGINS (Development)
# =================================
CORS_ORIGINS="http://localhost:3001"

# =================================
# OAUTH PROVIDERS (Optional in dev)
# =================================
# GOOGLE_CLIENT_ID="your-google-client-id"
# GOOGLE_CLIENT_SECRET="your-google-client-secret"

# FACEBOOK_APP_ID="your-facebook-app-id"
# FACEBOOK_APP_SECRET="your-facebook-app-secret"

# LINKEDIN_CLIENT_ID="your-linkedin-client-id"
# LINKEDIN_CLIENT_SECRET="your-linkedin-client-secret"

# TWITTER_API_KEY="your-twitter-api-key"
# TWITTER_API_SECRET="your-twitter-api-secret"

# =================================
# CLOUDINARY (Optional in dev)
# =================================
# CLOUDINARY_CLOUD_NAME="your-cloud-name"
# CLOUDINARY_API_KEY="your-api-key"
# CLOUDINARY_API_SECRET="your-api-secret"

# =================================
# EMAIL / SMTP (Optional in dev)
# =================================
# SMTP_HOST="smtp.gmail.com"
# SMTP_PORT=587
# SMTP_USER="your-email@gmail.com"
# SMTP_PASS="your-app-password"
# SMTP_FROM_EMAIL="noreply@easypost.com"

# =================================
# AI PROVIDERS (Optional in dev)
# =================================
# OPENAI_API_KEY="sk-..."
# or
# ANTHROPIC_API_KEY="sk-ant-..."

# =================================
# STRIPE PAYMENTS (Optional in dev)
# =================================
# STRIPE_SECRET_KEY="sk_test_..."
# STRIPE_WEBHOOK_SECRET="whsec_..."

# =================================
# REDIS (Optional - for queues)
# =================================
# REDIS_URL="redis://localhost:6379"
EOF

# Installer dépendances avec pnpm
pnpm install

# Générer Prisma Client
pnpm prisma generate

# Appliquer migrations
pnpm prisma migrate dev

# (Optionnel) Seed données de test
pnpm prisma db seed

# Démarrer en mode développement
pnpm run start:dev

# ✅ Backend disponible sur http://localhost:3000
```

**Vérification Backend**:
```bash
curl http://localhost:3000/health
# Expected: {"status":"ok","timestamp":"..."}
```

### 2️⃣ Frontend (frontend-next)

```bash
cd frontend-next

# Créer fichier .env.local
cat > .env.local << 'EOF'
# =================================
# API BACKEND
# =================================
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_API_VERSION=v1

# =================================
# APPLICATION
# =================================
NEXT_PUBLIC_APP_URL=http://localhost:3001
NEXT_PUBLIC_ENV=development

# =================================
# OAUTH CALLBACK (Development)
# =================================
NEXT_PUBLIC_GOOGLE_REDIRECT_URI=http://localhost:3001/auth/callback

# =================================
# ANALYTICS (Optional)
# =================================
# NEXT_PUBLIC_GA_TRACKING_ID=G-XXXXXXXXXX
EOF

# Installer dépendances avec pnpm
pnpm install

# Démarrer en mode développement (port 3001)
pnpm dev -- -p 3001

# ✅ Frontend disponible sur http://localhost:3001
```

**Vérification Frontend**:
```
Ouvrir navigateur: http://localhost:3001
Console devrait montrer connexion à http://localhost:3000
```

## 🌐 Configuration Production

### Backend (Render)

**Dashboard Render**: https://dashboard.render.com  
**Service Name**: easypostv2  
**URL**: https://easypostv2.onrender.com

#### Build Settings

```yaml
# Build Command
pnpm install && pnpm prisma generate && pnpm run build

# Start Command
pnpm run start:prod

# Environment
NODE_ENV=production
```

#### Variables d'Environnement (Render)

```bash
# DATABASE (Neon Production)
DATABASE_URL=postgresql://[user]:[password]@[prod-host]/[database]?sslmode=require&connection_limit=10

# JWT
JWT_SECRET=[production-secret-32-chars-minimum]
JWT_EXPIRATION=7d
REFRESH_TOKEN_SECRET=[production-refresh-secret]
REFRESH_TOKEN_EXPIRATION=30d

# APPLICATION
NODE_ENV=production
API_PORT=3000
API_URL=https://easypostv2.onrender.com
FRONTEND_URL=https://easyposttio.vercel.app
FRONTEND_NEXT_URL=https://easyposttio.vercel.app

# CORS
CORS_ORIGINS=https://easyposttio.vercel.app

# OAUTH PROVIDERS (Production credentials)
GOOGLE_CLIENT_ID=[production-google-client-id]
GOOGLE_CLIENT_SECRET=[production-google-secret]
# ... autres providers

# CLOUDINARY
CLOUDINARY_CLOUD_NAME=[your-cloud-name]
CLOUDINARY_API_KEY=[your-api-key]
CLOUDINARY_API_SECRET=[your-api-secret]

# EMAIL
SMTP_HOST=[your-smtp-host]
SMTP_PORT=587
SMTP_USER=[your-smtp-user]
SMTP_PASS=[your-smtp-password]
SMTP_FROM_EMAIL=noreply@easypost.com

# AI
OPENAI_API_KEY=[production-openai-key]
# or
ANTHROPIC_API_KEY=[production-anthropic-key]

# STRIPE
STRIPE_SECRET_KEY=[production-stripe-key]
STRIPE_WEBHOOK_SECRET=[production-webhook-secret]

# REDIS (if used)
# REDIS_URL=[redis-connection-string]
```

#### Release Command (Migrations)

Dans Render Dashboard > Settings > Build & Deploy:

```bash
pnpm prisma migrate deploy
```

### Frontend (Vercel)

**Dashboard Vercel**: https://vercel.com/dashboard  
**Project Name**: easyposttio  
**URL**: https://easyposttio.vercel.app

#### Build Settings

```yaml
# Framework Preset: Next.js
# Root Directory: frontend-next
# Build Command: pnpm run build
# Output Directory: .next
# Install Command: pnpm install
```

#### Variables d'Environnement (Vercel)

```bash
# API BACKEND
NEXT_PUBLIC_API_URL=https://easypostv2.onrender.com
NEXT_PUBLIC_API_VERSION=v1

# APPLICATION
NEXT_PUBLIC_APP_URL=https://easyposttio.vercel.app
NEXT_PUBLIC_ENV=production

# OAUTH
NEXT_PUBLIC_GOOGLE_REDIRECT_URI=https://easyposttio.vercel.app/auth/callback

# ANALYTICS (Optional)
NEXT_PUBLIC_GA_TRACKING_ID=[your-ga-tracking-id]
```

## 🔧 Commandes pnpm Courantes

### Backend (Nestjs_Backend)

```bash
# Développement
pnpm run start:dev          # Mode watch
pnpm run start:debug        # Mode debug

# Production
pnpm run build              # Build production
pnpm run start:prod         # Start production

# Tests
pnpm run test               # Unit tests
pnpm run test:watch         # Watch mode
pnpm run test:cov           # Coverage
pnpm run test:e2e           # E2E tests

# Prisma
pnpm prisma generate        # Générer client
pnpm prisma migrate dev     # Migration dev
pnpm prisma migrate deploy  # Migration prod
pnpm prisma studio          # GUI database
pnpm prisma db seed         # Seed data

# Linting
pnpm run lint               # ESLint
pnpm run format             # Prettier
```

### Frontend (frontend-next)

```bash
# Développement
pnpm dev                    # Start dev (port 3000 par défaut)
pnpm dev -- -p 3001        # Start dev sur port 3001

# Production
pnpm build                  # Build production
pnpm start                  # Start production

# Tests
pnpm test                   # Run tests
pnpm test:watch            # Watch mode

# Linting
pnpm lint                   # Next.js lint
pnpm lint:fix              # Auto-fix
```

## 🗄️ Database (Neon PostgreSQL)

### Dashboard

**Console Neon**: https://console.neon.tech  
**Type**: Serverless PostgreSQL  

### Connection Strings

```bash
# Production
DATABASE_URL="postgresql://[user]:[password]@[prod-host]/[database]?sslmode=require"

# Development (Branch)
DATABASE_URL="postgresql://[user]:[password]@[dev-host]/[database]?sslmode=require"
```

⚠️ **Important**: 
- Toujours utiliser `?sslmode=require` avec Neon
- Ajouter `&connection_limit=10` en production (Render)

### Branching Strategy (Recommandé)

```
main (production)
├── dev (development)
└── staging (staging)
```

Créer branches dans Neon Dashboard:
1. Aller dans Neon Console
2. Sélectionner votre projet
3. Cliquer "Create Branch"
4. Utiliser connection string de la branche dans .env local

## 🔐 CORS Configuration

### Backend (main.ts)

```typescript
// Nestjs_Backend/src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // CORS Configuration
  app.enableCors({
    origin: [
      'http://localhost:3001',              // Local dev
      'https://easyposttio.vercel.app',     // Production
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  await app.listen(process.env.API_PORT || 3000);
}
bootstrap();
```

## 🔍 Vérification Setup Complet

### Checklist Local

```bash
# 1. Backend
cd Nestjs_Backend
pnpm install
pnpm prisma generate
pnpm prisma migrate dev
pnpm run start:dev
curl http://localhost:3000/health
# ✅ Should return {"status":"ok"}

# 2. Frontend
cd ../frontend-next
pnpm install
pnpm dev -- -p 3001
# ✅ Open http://localhost:3001
# ✅ Should show homepage

# 3. Test API connection
# Dans la console navigateur (http://localhost:3001):
fetch('http://localhost:3000/health')
  .then(r => r.json())
  .then(console.log)
# ✅ Should return health status
```

### Checklist Production

```bash
# 1. Backend Health
curl https://easypostv2.onrender.com/health
# ✅ Should return {"status":"ok"}

# 2. Frontend Live
curl https://easyposttio.vercel.app
# ✅ Should return HTML

# 3. Frontend → Backend Connection
# Ouvrir https://easyposttio.vercel.app
# Console navigateur ne devrait pas montrer d'erreurs CORS
# Test signup/login devrait fonctionner
```

## 🐛 Troubleshooting

### Problème: pnpm command not found

```bash
# Installer pnpm globalement
npm install -g pnpm

# Vérifier installation
pnpm --version

# Alternative: utiliser npx
npx pnpm install
```

### Problème: Port 3000 ou 3001 déjà utilisé

```bash
# Trouver et tuer le processus
# Mac/Linux
lsof -ti:3000 | xargs kill -9
lsof -ti:3001 | xargs kill -9

# Windows
netstat -ano | findstr :3000
taskkill /PID [PID] /F
```

### Problème: CORS Error en local

```bash
# Vérifier que backend tourne sur port 3000
curl http://localhost:3000/health

# Vérifier configuration CORS dans main.ts
# Origin doit inclure http://localhost:3001

# Redémarrer backend après modification
pnpm run start:dev
```

### Problème: Frontend ne se connecte pas au backend

```bash
# Vérifier .env.local
cat frontend-next/.env.local
# NEXT_PUBLIC_API_URL doit être http://localhost:3000

# Vérifier dans le navigateur (Console)
console.log(process.env.NEXT_PUBLIC_API_URL)

# Redémarrer frontend après modification .env.local
pnpm dev -- -p 3001
```

### Problème: Migrations Prisma échouent

```bash
cd Nestjs_Backend

# Vérifier connexion DB
pnpm prisma db push

# Si échec, vérifier DATABASE_URL dans .env
cat .env | grep DATABASE_URL

# Tester connexion manuellement
psql "postgresql://..."

# Reset database (⚠️ perte de données)
pnpm prisma migrate reset
```

## 📊 Structure Projet

```
EasyPostV2/
│
├── Nestjs_Backend/              ✅ UTILISÉ (Backend)
│   ├── src/
│   │   ├── main.ts              # Entry point (port 3000)
│   │   ├── app.module.ts        # Root module
│   │   ├── modules/             # Business modules
│   │   │   ├── auth/
│   │   │   ├── posts/
│   │   │   ├── workspaces/
│   │   │   ├── social-accounts/
│   │   │   ├── ai/
│   │   │   └── media/
│   │   └── common/              # Guards, decorators, providers
│   ├── prisma/
│   │   ├── schema.prisma        # Database schema
│   │   └── migrations/          # SQL migrations
│   ├── package.json             # pnpm dependencies
│   ├── pnpm-lock.yaml
│   └── .env                     # Local config (not committed)
│
├── frontend-next/               ✅ UTILISÉ (Frontend)
│   ├── src/
│   │   ├── app/                 # Next.js App Router
│   │   │   ├── page.tsx         # Homepage
│   │   │   ├── dashboard/       # Dashboard pages
│   │   │   ├── login/
│   │   │   └── signup/
│   │   ├── components/
│   │   │   └── easypost/        # Business components
│   │   ├── services/            # API clients
│   │   │   ├── postApi.ts
│   │   │   ├── workspaceApi.ts
│   │   │   └── aiApi.ts
│   │   └── lib/
│   │       └── api.ts           # Base API config
│   ├── package.json             # pnpm dependencies
│   ├── pnpm-lock.yaml
│   ├── .env.local               # Local config (not committed)
│   └── next.config.ts
│
├── backend/                     ❌ NON UTILISÉ (ignorer)
├── frontend/                    ❌ NON UTILISÉ (ignorer)
│
└── .env.example                 ⚠️ À CRÉER
```

## 📝 Fichiers à Créer/Mettre à Jour

### 1. Nestjs_Backend/.env.example

```bash
cd Nestjs_Backend

cat > .env.example << 'EOF'
# =================================
# DATABASE
# =================================
DATABASE_URL="postgresql://user:password@host:5432/database?sslmode=require"

# =================================
# JWT
# =================================
JWT_SECRET="your-jwt-secret-here"
JWT_EXPIRATION="7d"
REFRESH_TOKEN_SECRET="your-refresh-secret-here"
REFRESH_TOKEN_EXPIRATION="30d"

# =================================
# APPLICATION
# =================================
NODE_ENV="development"
API_PORT=3000
API_URL="http://localhost:3000"
FRONTEND_URL="http://localhost:3001"
FRONTEND_NEXT_URL="http://localhost:3001"

# =================================
# OAUTH (Optional)
# =================================
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-secret"

# =================================
# CLOUDINARY (Optional)
# =================================
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# =================================
# EMAIL (Optional)
# =================================
SMTP_HOST="smtp.example.com"
SMTP_PORT=587
SMTP_USER="your-email@example.com"
SMTP_PASS="your-password"

# =================================
# AI (Optional)
# =================================
OPENAI_API_KEY="sk-..."
EOF

git add .env.example
```

### 2. frontend-next/.env.example

```bash
cd frontend-next

cat > .env.example << 'EOF'
# =================================
# API BACKEND
# =================================
NEXT_PUBLIC_API_URL="http://localhost:3000"
NEXT_PUBLIC_API_VERSION="v1"

# =================================
# APPLICATION
# =================================
NEXT_PUBLIC_APP_URL="http://localhost:3001"
NEXT_PUBLIC_ENV="development"

# =================================
# OAUTH
# =================================
NEXT_PUBLIC_GOOGLE_REDIRECT_URI="http://localhost:3001/auth/callback"
EOF

git add .env.example
```

### 3. README.md (racine projet)

```bash
cat > README.md << 'EOF'
# EasyPostV2

Plateforme SaaS de gestion de contenu social et productivité d'équipe.

## 🌐 URLs Production

- **Frontend**: https://easyposttio.vercel.app
- **Backend API**: https://easypostv2.onrender.com
- **Database**: Neon PostgreSQL (Serverless)

## 🚀 Quick Start

### Prérequis

- Node.js 18+
- pnpm (package manager)
- PostgreSQL (Neon)

### Installation

1. Clone le repository
2. Setup backend:
   ```bash
   cd Nestjs_Backend
   cp .env.example .env
   # Éditer .env avec vos credentials
   pnpm install
   pnpm prisma migrate dev
   pnpm run start:dev
   ```

3. Setup frontend:
   ```bash
   cd frontend-next
   cp .env.example .env.local
   # Éditer .env.local
   pnpm install
   pnpm dev -- -p 3001
   ```

## 📂 Structure

- `Nestjs_Backend/` - API NestJS (port 3000)
- `frontend-next/` - Frontend Next.js (port 3001)

## 🛠️ Tech Stack

**Backend**: NestJS, Prisma, PostgreSQL (Neon)
**Frontend**: Next.js 14, React Query, TailwindCSS
**Deployment**: Render (backend), Vercel (frontend)
**Package Manager**: pnpm

## 📚 Documentation

Voir `/docs` pour documentation complète.
EOF

git add README.md
```

## 🎯 Next Steps

### Priorité Immédiate

- [ ] Créer `.env.example` files (backend + frontend)
- [ ] Tester connexion frontend → backend en production
- [ ] Setup Swagger documentation
- [ ] Créer tests de base

### Priorité Court Terme

- [ ] Setup CI/CD (GitHub Actions)
- [ ] Monitoring (Sentry)
- [ ] Logging amélioré
- [ ] Tests coverage > 80%

---

**Configuration Finale Validée**  
**Date**: 28 janvier 2026  
**Package Manager**: pnpm  
**Ports**: Backend 3000, Frontend 3001  
**Production**: ✅ Backend + Frontend déployés