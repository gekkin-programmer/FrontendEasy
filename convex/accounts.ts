import { query, mutation, internalMutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";

// --- PUBLIC QUERIES ---

export const getByWorkspace = query({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("accounts")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .collect();
  },
});

// --- PUBLIC MUTATIONS ---

export const connectRealFacebookPage = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    platformAccountId: v.string(),
    platformUsername: v.string(),
    accessToken: v.string(),
    avatarUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const existing = await ctx.db
      .query("accounts")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .filter((q) => q.eq(q.field("platformAccountId"), args.platformAccountId))
      .first();

    if (existing) {
      return await ctx.db.patch(existing._id, {
        accessToken: args.accessToken,
        tokenExpiresAt: Date.now() + (1000 * 60 * 60 * 24 * 60),
      });
    }

    return await ctx.db.insert("accounts", {
      workspaceId: args.workspaceId,
      platform: "facebook",
      platformAccountId: args.platformAccountId,
      platformUsername: args.platformUsername,
      accessToken: args.accessToken,
      avatarUrl: args.avatarUrl || `https://ui-avatars.com/api/?name=${args.platformUsername}`,
      tokenExpiresAt: Date.now() + (1000 * 60 * 60 * 24 * 60),
    });
  },
});

export const disconnect = mutation({
  args: { accountId: v.id("accounts") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");
    await ctx.db.delete(args.accountId);
  },
});

/**
 * IMPORTANT: This MUST be a 'mutation', not 'internalMutation', 
 * so the frontend can call it directly.
 */
export const saveAccount = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    platform: v.string(),
    platformAccountId: v.string(),
    platformUsername: v.string(),
    accessToken: v.string(),
    avatarUrl: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const existing = await ctx.db
      .query("accounts")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .filter((q) => q.eq(q.field("platformAccountId"), args.platformAccountId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        accessToken: args.accessToken,
        platformUsername: args.platformUsername,
        avatarUrl: args.avatarUrl,
        tokenExpiresAt: Date.now() + (1000 * 60 * 60 * 24 * 60),
      });
    } else {
      await ctx.db.insert("accounts", {
        workspaceId: args.workspaceId,
        platform: args.platform,
        platformAccountId: args.platformAccountId,
        platformUsername: args.platformUsername,
        accessToken: args.accessToken,
        avatarUrl: args.avatarUrl,
        tokenExpiresAt: Date.now() + (1000 * 60 * 60 * 24 * 60),
      });
    }
  },
});

export const mockConnect = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    platform: v.string(),
    username: v.string(),
    platformAccountId: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    await ctx.db.insert("accounts", {
      workspaceId: args.workspaceId,
      platform: args.platform,
      platformAccountId: args.platformAccountId,
      platformUsername: args.username,
      accessToken: "mock_token_" + Date.now(),
      avatarUrl: `https://ui-avatars.com/api/?name=${args.username}&background=random`,
      tokenExpiresAt: Date.now() + (1000 * 60 * 60 * 24 * 60),
    });
  },
});

// --- INTERNAL MUTATIONS ---

export const linkTelegramInternal = internalMutation({
  args: {
    workspaceId: v.string(), 
    chatId: v.string(),
    username: v.string(),
  },
  handler: async (ctx, args) => {
    const workspaceId = args.workspaceId as any;
    const existing = await ctx.db
      .query("accounts")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", workspaceId))
      .filter(q => q.eq(q.field("platformAccountId"), args.chatId))
      .first();

    if (existing) return; 

    await ctx.db.insert("accounts", {
      workspaceId: workspaceId,
      platform: "telegram",
      platformUsername: args.username,
      platformAccountId: args.chatId, 
      avatarUrl: "https://upload.wikimedia.org/wikipedia/commons/8/82/Telegram_logo.svg",
      credentials: {
        botToken: process.env.TELEGRAM_BOT_TOKEN!, 
        chatId: args.chatId,
      }
    });
  },
});

// --- INTERNAL QUERIES ---

export const getAccountInternal = internalQuery({
  args: { accountId: v.id("accounts") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.accountId);
  },
});

export const getAccountById = internalQuery({
  args: { accountId: v.id("accounts") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.accountId);
  },
});

export const getAccountByPost = internalQuery({
  args: { postId: v.id("posts") },
  handler: async (ctx, args) => {
    const post = await ctx.db.get(args.postId);
    if (!post) return null;
    return await ctx.db.get(post.accountId);
  },
});

export const getAllInternal = internalQuery({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("accounts").collect();
  },
});