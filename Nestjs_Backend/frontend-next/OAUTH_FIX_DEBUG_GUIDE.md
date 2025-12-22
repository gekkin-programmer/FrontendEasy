# OAuth Redirect Loop - Complete Fix Guide

## 🔴 Problem
After clicking "Sign in with Google":
1. User authenticates with Google ✅
2. Redirected to `/sso-callback` ✅
3. Should go to `/dashboard`
4. **Instead**: Redirected back to `/login?redirect_url=...` ❌

## 🔍 Root Causes (What Was Wrong)

### Before Fix
- `AuthenticateWithRedirectCallback` component alone doesn't guarantee session completion
- User wasn't being synced to Convex database before redirect
- No error handling or logging to debug the flow
- Possible race condition: auth completes but Convex isn't ready

### After Fix
✅ Manually handle the callback with proper sequence:
1. Wait for Clerk user to load
2. Verify user is signed in
3. Wait for Convex auth to load
4. Sync user to Convex database
5. Add delay to ensure session establishment
6. Then redirect to dashboard

---

## 📝 Changes Made

### File: `src/app/sso-callback/page.tsx`
**Changed from**: Simple `AuthenticateWithRedirectCallback` component
**Changed to**: Manual callback handler with proper sequencing and error handling

**Key improvements**:
- ✅ Checks `useAuth()` to verify Clerk authentication
- ✅ Checks `useUser()` to get authenticated user details
- ✅ Checks `useConvexAuth()` to verify Convex is ready
- ✅ Calls `storeUser()` mutation to sync with Convex
- ✅ Adds 500ms delay to ensure session is fully established
- ✅ Proper error handling with feedback
- ✅ Console logging for debugging
- ✅ Graceful fallback to login page if something fails

---

## ⚙️ Configuration Checklist

### 1. Clerk Dashboard Setup
Go to https://dashboard.clerk.com → Your Project → Settings → OAuth & Permissions

Ensure these OAuth providers are enabled:
- ✅ Google
- ✅ GitHub (if using)
- (Others as needed)

### 2. Redirect URLs in Clerk Dashboard
Go to Settings → Paths → OAuth redirect URL

Add this URL:
```
http://localhost:3000/sso-callback    (development)
https://yourdomain.com/sso-callback   (production)
```

### 3. Environment Variables
Verify `.env.local` has:
```bash
# Clerk Keys
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Redirect URLs
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/login
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/signup
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# Convex
NEXT_PUBLIC_CONVEX_URL=https://...convex.cloud
CONVEX_DEPLOYMENT=dev:...
```

### 4. Convex Schema
Verify `convex/schema.ts` has the `users` table:
```typescript
users: defineTable({
  tokenIdentifier: v.string(),
  name: v.optional(v.string()),
  email: v.optional(v.string()),
}).index("by_token", ["tokenIdentifier"]),
```

### 5. Convex `users.ts` Mutation
Verify the `store()` mutation exists:
```typescript
export const store = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();
    
    if (user !== null) return user._id;
    
    return await ctx.db.insert("users", {
      tokenIdentifier: identity.tokenIdentifier,
      name: identity.name || "Anonymous",
      email: identity.email,
    });
  },
});
```

---

## 🧪 Testing Steps

### Step 1: Clear Browser Data
```bash
1. Open DevTools (F12)
2. Application → Clear all cookies & localStorage
3. Close and reopen browser
```

### Step 2: Start Development Server
```bash
# Terminal 1: Convex backend
npx convex dev

# Terminal 2: Next.js frontend
npm run dev
```

### Step 3: Test Google Login Flow
```
1. Navigate to http://localhost:3000
2. Click "Login" in navbar
3. Click "Sign in with Google"
4. Select/login with your Google account
5. Grant permissions if prompted
6. You should see loading spinner on /sso-callback
7. Console should show:
   - "Waiting for Clerk user to load..."
   - "✅ Clerk auth successful for: your-email@gmail.com"
   - "Waiting for Convex auth..."
   - "Syncing user to Convex..."
   - "✅ User synced to Convex: ..."
   - "Redirecting to dashboard..."
8. Should redirect to /dashboard
   - If first time: → /onboarding (select category & plan)
   - If existing user: → /dashboard/{workspaceId}
```

### Step 4: Verify in Convex Dashboard
1. Go to https://dashboard.convex.dev
2. Click your project
3. Click "Data" tab
4. Look for `users` table
5. You should see a new user entry with:
   - `tokenIdentifier`: Your Clerk token
   - `name`: Your full name
   - `email`: Your email

---

## 🐛 Debugging Tips

### If still stuck on login page:

**1. Check Console Errors**
```bash
Press F12 → Console tab
Look for red errors from Clerk or Convex
```

**2. Check Network Tab**
```bash
F12 → Network tab
During login, look for:
- /sso-callback request (should succeed)
- /api calls (should have no 401s)
```

**3. Add Debug Logging**
Edit `sso-callback/page.tsx` and add more `console.log()` statements to track the flow.

**4. Check Clerk Dashboard Logs**
Go to https://dashboard.clerk.com → Logs
Look for authentication events and errors.

**5. Check Convex Errors**
Run `npx convex dev` and watch for errors when calling `storeUser()`.

### Common Issues:

| Issue | Solution |
|-------|----------|
| "Not authenticated" error | Clerk auth didn't complete. Check Clerk dashboard OAuth settings. |
| Stuck on loading spinner | Convex auth not ready. Check CONVEX_DEPLOYMENT env var. |
| User not in Convex DB | `storeUser()` mutation failed. Check Convex logs. |
| Redirected back to /login | Session established but auth check failed. Clear cookies and try again. |

---

## 🚀 What Happens Now (Happy Path)

```
User visits /login
  ↓
Clicks "Sign in with Google"
  ↓
Redirected to Google OAuth
  ↓
User authenticates with Google
  ↓
Redirected back to /sso-callback?code=...&session_id=...
  ↓
SSOCallback component loads:
  1. Waits for Clerk user to load
  2. Confirms user is signed in with Clerk
  3. Waits for Convex auth to load
  4. Calls storeUser() to sync to Convex
  5. Waits 500ms for session establishment
  6. Redirects to /dashboard
  ↓
Dashboard checks user's workspaces:
  1. If no workspaces → /onboarding
  2. If has workspaces → /dashboard/{workspaceId}
  ↓
User is logged in! ✅
```

---

## 📋 Production Deployment Checklist

Before deploying to production:

- [ ] Update redirect URLs in Clerk dashboard with production domain
- [ ] Update redirect URLs in `.env.production`
- [ ] Test with actual production Clerk project
- [ ] Ensure Convex production deployment is active
- [ ] Monitor authentication logs for issues
- [ ] Add error tracking (Sentry, LogRocket, etc.)
- [ ] Implement user feedback mechanism for auth issues

---

## 💡 If Issues Persist

1. **Try the manual Clerk setup**: Instead of `authenticateWithRedirect`, try `signIn.create()` approach
2. **Use Clerk's UI Components**: Consider `<SignInButton />` component as fallback
3. **Check Clerk version**: Ensure you're on latest `@clerk/nextjs@6.x`
4. **Verify Convex integration**: Make sure Convex is properly initialized in `ConvexClientProvider`
5. **Check for network issues**: VPN or proxy might interfere with OAuth

---

**If the fix doesn't work, please provide:**
1. Browser console errors (full error messages)
2. Network tab screenshot showing failed requests
3. Clerk dashboard logs screenshot
4. Output of `npx convex dev` when trying to authenticate

This should resolve your OAuth redirect loop! 🎉
