"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

export const handleFacebookCallback = action({
  args: { code: v.string(), workspaceId: v.id("workspaces") },
  handler: async (ctx, args) => {
    // 1. Exchange code for token with Facebook
    // (You'll need your FB_APP_ID and FB_APP_SECRET in Convex Environment Variables)
    
    // 2. Once you have the data, call the internal mutation
    await ctx.runMutation(internal.accounts.saveAccount, {
      workspaceId: args.workspaceId,
      platform: "facebook",
      platformAccountId: "12345", // From FB response
      platformUsername: "User Name", // From FB response
      accessToken: "access_token_here",
      avatarUrl: "https://...", 
    });
  },
});