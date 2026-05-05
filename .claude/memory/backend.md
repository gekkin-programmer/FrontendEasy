# Backend Deep Dive — NestJS 11 (tchokos-backend)

## Architecture & Modules
- **Database:** Prisma 6 + PostgreSQL (Neon).
- **Auth:** JWT-based (7d access, 30d refresh).
  - Guards: `JwtAuthGuard` -> `RolesGuard` -> `SubscriptionGuard`.
  - Decorators: `@CurrentUser()`, `@Public()`, `@Roles('ADMIN')`.
- **Queueing:** BullMQ 5 + Redis (TLS). Used for social media syncing and post-scheduling.
- **AI Integration:** LangChain + OpenAI.
  - Tones: PROFESSIONAL, CASUAL, NOUCHI, CAMFRANGLAIS, PIDGIN.

## WebSocket Patterns (`AppEventsGateway`)
- Namespace: `/events`.
- Channels: `sendToWorkspace(workspaceId, event, data)` and `sendToUser(userId, event, data)`.

## Environment & Security
- **Global Prefix:** `/api`.
- **Documentation:** Swagger UI at `/api-docs`.
- **Throttling:** `@nestjs/throttler` enabled on sensitive routes.
- **CORS:** Restricted to `FRONTEND_URL` and `FRONTEND_NEXT_URL`.

## Key Logic
- **Payments:** Integrated with PawaPay (Africa-focused) and Stripe.
- **Storage:** Cloudinary for all media assets.