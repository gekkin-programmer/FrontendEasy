// convex/meta.ts
import { action, mutation } from "./_generated/server";
import { v } from "convex/values";

// 1. ACTION: Exchange Code for Page List
export const resolveTokenAndListPages = action({
  args: { 
    code: v.string(), 
    redirectUri: v.string() 
  },
  handler: async (ctx, args) => {
    const clientId = process.env.META_CLIENT_ID;
    const clientSecret = process.env.META_CLIENT_SECRET;

    if (!clientId || !clientSecret) throw new Error("Meta credentials missing in Convex Dashboard");

    const tokenParams = new URLSearchParams({
      client_id: clientId,
      redirect_uri: args.redirectUri,
      client_secret: clientSecret,
      code: args.code,
    });

    const tokenRes = await fetch(`https://graph.facebook.com/v18.0/oauth/access_token?${tokenParams}`);
    const tokenData = await tokenRes.json();

    if (tokenData.error) throw new Error("FB Auth Error: " + tokenData.error.message);
    
    const userAccessToken = tokenData.access_token;

    const pagesRes = await fetch(
      `https://graph.facebook.com/v18.0/me/accounts?access_token=${userAccessToken}&fields=id,name,access_token,picture{url},instagram_business_account{id,username,profile_picture_url}`
    );
    const pagesData = await pagesRes.json();

    return pagesData.data;
  },
});

// 2. MUTATION: Save the Selected Page
export const saveMetaAccount = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    platform: v.string(),
    platformAccountId: v.string(),
    name: v.string(),
    pictureUrl: v.optional(v.string()),
    accessToken: v.string(),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    // Check if already connected
    // We use getAll and find() to avoid type issues if indexes aren't fully synced yet
    const allAccounts = await ctx.db
      .query("accounts")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .collect();

    const existing = allAccounts.find(a => a.platformAccountId === args.platformAccountId);

    if (existing) {
      // Update token if re-connecting
      await ctx.db.patch(existing._id, {
        accessToken: args.accessToken,
        avatarUrl: args.pictureUrl,
        platformUsername: args.name // <--- FIXED: Mapped 'name' arg to 'platformUsername' field
      });
      return existing._id;
    }

    // Create new
    return await ctx.db.insert("accounts", {
      workspaceId: args.workspaceId,
      platform: args.platform,
      platformAccountId: args.platformAccountId,
      platformUsername: args.name, // Mapped 'name' arg to 'platformUsername' field
      avatarUrl: args.pictureUrl,
      accessToken: args.accessToken,
      metadata: args.metadata,
      tokenExpiresAt: Date.now() + (60 * 24 * 60 * 60 * 1000), 
    });
  },
});