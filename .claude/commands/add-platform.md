Guide through adding a new social media platform to EasyPostV2.

Platform name: $ARGUMENTS

This touches both the backend and frontend. Follow each step carefully.

---

## Step 1 — Backend: Prisma Schema

In `Nestjs_Backend/prisma/schema.prisma`, add the new platform to the `SocialAccountProvider` enum:

```prisma
enum SocialAccountProvider {
  FACEBOOK
  INSTAGRAM
  TWITTER
  LINKEDIN
  TIKTOK
  YOUTUBE
  PINTEREST
  THREADS
  WHATSAPP
  <PLATFORM_NAME_UPPERCASE>   // ← add here
}
```

Then run:
```bash
cd Nestjs_Backend
pnpm prisma migrate dev --name add-<platform>-provider
pnpm prisma generate
```

---

## Step 2 — Backend: Passport OAuth Strategy

Create `Nestjs_Backend/src/modules/social-accounts/strategies/<platform>.strategy.ts`:

```typescript
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-<platform>';
import { Injectable } from '@nestjs/common';

@Injectable()
export class <Platform>Strategy extends PassportStrategy(Strategy, '<platform>') {
  constructor() {
    super({
      clientID: process.env.<PLATFORM>_CLIENT_ID,
      clientSecret: process.env.<PLATFORM>_CLIENT_SECRET,
      callbackURL: `${process.env.API_URL}/api/social-accounts/<platform>/redirect`,
      scope: ['<required scopes>'],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any) {
    return { accessToken, refreshToken, profile };
  }
}
```

Add the required strategy package: `pnpm add passport-<platform>`

---

## Step 3 — Backend: Controller Routes

In `Nestjs_Backend/src/modules/social-accounts/social-accounts.controller.ts`, add:

```typescript
@Get('<platform>')
@UseGuards(JwtAuthGuard, <Platform>AuthGuard)
connect<Platform>(@CurrentUser() user) {
  // Redirects to platform OAuth
}

@Get('<platform>/redirect')
@UseGuards(<Platform>AuthGuard)
async <platform>Callback(@CurrentUser() user, @Req() req, @Res() res) {
  await this.socialAccountsService.handleOAuthCallback(
    user.id,
    '<PLATFORM_NAME_UPPERCASE>',
    req.user.accessToken,
    req.user.refreshToken,
    req.user.profile,
  );
  return res.redirect(`${process.env.FRONTEND_URL}/dashboard`);
}
```

Register `<Platform>Strategy` in `social-accounts.module.ts` providers.

---

## Step 4 — Backend: Publisher Service

In `Nestjs_Backend/src/modules/posts/publisher.service.ts`, add a case for the new platform in the publish switch/if block:

```typescript
case '<PLATFORM_NAME_UPPERCASE>':
  await this.publish<Platform>(post, account);
  break;

private async publish<Platform>(post: Post, account: SocialAccount) {
  // Call the platform API with account.accessToken
}
```

---

## Step 5 — Backend: Environment Variables

Add to `Nestjs_Backend/.env.example`:
```env
<PLATFORM>_CLIENT_ID=
<PLATFORM>_CLIENT_SECRET=
<PLATFORM>_CALLBACK_URL=${API_URL}/api/social-accounts/<platform>/redirect
```

---

## Step 6 — Frontend: Types

In `frontend-next/src/components/easypost/types.ts`, add to `ChannelType`:

```typescript
type ChannelType = 'twitter' | 'instagram' | 'linkedin' | 'tiktok' | 'youtube' | 'facebook' | 'pinterest' | 'google' | '<platform>';
```

---

## Step 7 — Frontend: Connect Accounts UI

In `frontend-next/src/components/easypost/ConnectAccounts.tsx`:

1. Add a new platform object to the platforms array:
```typescript
{
  id: '<platform>',
  name: t('<Platform>', '<Plateforme>'),
  icon: <PlatformIcon />,   // from react-icons or lucide
  color: '#000000',          // platform brand color
}
```

2. The connect button should call:
```typescript
window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/social-accounts/<platform>`;
```

---

## Step 8 — Verification

- [ ] Prisma migration ran successfully
- [ ] OAuth redirect works (test manually)
- [ ] Account appears in `GET /api/social-accounts` after connecting
- [ ] Post can be created targeting the new platform
- [ ] Platform appears in `ConnectAccounts.tsx` UI
- [ ] Platform icon shows in `PostFeed.tsx` channel list
