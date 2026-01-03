import { query, mutation, internalMutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

// Helper for status type safety
const statusValidator = v.union(
  v.literal("draft"),
  v.literal("scheduled"),
  v.literal("published"),
  v.literal("failed"),
  v.literal("archived")
);

// --- PUBLIC QUERIES ---

export const getWorkspacePosts = query({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, args) => {
    const posts = await ctx.db
      .query("posts")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .order("desc") 
      .collect();

    return await Promise.all(
      posts.map(async (post) => {
        let mediaUrl = null;
        if (post.mediaStorageIds && post.mediaStorageIds.length > 0) {
          mediaUrl = await ctx.storage.getUrl(post.mediaStorageIds[0]);
        }
        return { ...post, mediaUrl };
      })
    );
  },
});

// --- PUBLIC MUTATIONS ---

export const generateUploadUrl = mutation(async (ctx) => {
  return await ctx.storage.generateUploadUrl();
});

export const createPost = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    accountId: v.id("accounts"),
    content: v.string(),
    scheduledTime: v.number(),
    category: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    mediaStorageIds: v.optional(v.array(v.id("_storage"))),
    mediaType: v.optional(v.union(v.literal("image"), v.literal("video"))),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("posts", {
      workspaceId: args.workspaceId,
      accountId: args.accountId,
      content: args.content,
      scheduledTime: args.scheduledTime,
      status: "scheduled",
      category: args.category || "General", 
      tags: args.tags || [],
      mediaStorageIds: args.mediaStorageIds,
      mediaType: args.mediaType,
    });
  },
});

export const updateStatus = mutation({
  args: { 
    postId: v.id("posts"), 
    status: statusValidator,
    scheduledTime: v.optional(v.number()) 
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.postId, {
      status: args.status,
      ...(args.scheduledTime ? { scheduledTime: args.scheduledTime } : {}),
    });
  },
});

export const deletePost = mutation({
  args: { postId: v.id("posts") },
  handler: async (ctx, args) => {
    const post = await ctx.db.get(args.postId);
    if (!post) return;

    if (post.mediaStorageIds) {
      for (const id of post.mediaStorageIds) {
        await ctx.storage.delete(id);
      }
    }

    if (post.status === "published" && post.publishedRemoteId) {
      const account = await ctx.db.get(post.accountId);
      if (account) {
          await ctx.scheduler.runAfter(0, internal.SocialActions.deleteExternalPost, {
              platform: account.platform,
              accessToken: account.accessToken || "",
              remoteId: post.publishedRemoteId,
          });
      }
    }
    
    await ctx.db.delete(args.postId);
  },
});

// --- INTERNAL HELPERS ---

export const getPostById = internalQuery({
  args: { postId: v.id("posts") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.postId);
  },
});

export const getImageUrl = internalQuery({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.storageId);
  },
});

export const markAsPublished = internalMutation({
  args: { postId: v.id("posts"), remoteId: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.postId, {
      status: "published",
      publishedRemoteId: args.remoteId,
      publishedTime: Date.now(),
    });
  }
});

export const markAsFailed = internalMutation({
  args: { postId: v.id("posts"), reason: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.postId, { status: "failed", failureReason: args.reason });
  }
});

/**
 * Stop tracking stats for a post by moving it to 'archived'.
 * This removes it from the analytics cron cycle.
 */
export const markAsArchived = internalMutation({
  args: { postId: v.id("posts") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.postId, {
      status: "archived"
    });
    console.log(`🗄️ Post ${args.postId} archived. Stats tracking stopped.`);
  }
});

// --- CRON LOGIC ---

export const publishDuePosts = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const scheduled = await ctx.db
      .query("posts")
      .withIndex("by_status", q => q.eq("status", "scheduled"))
      .collect();

    const due = scheduled.filter(p => p.scheduledTime <= now);
    
    for (const post of due) {
      // Safety: Only try to publish if there is an account attached
      if (post.accountId) {
        await ctx.scheduler.runAfter(0, internal.SocialActions.publishPost, { 
          postId: post._id 
        });
      } else {
        await ctx.db.patch(post._id, { 
          status: "failed", 
          failureReason: "No account linked to post." 
        });
      }
    }
  },
});