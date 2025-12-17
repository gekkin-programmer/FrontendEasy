import { query, mutation, internalMutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

// --- PUBLIC QUERIES ---

export const getWorkspacePosts = query({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, args) => {
    const posts = await ctx.db
      .query("posts")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .order("desc") 
      .collect();

    // Transform Storage ID -> URL for the frontend to display images
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

// 1. NEW: Generate URL for Frontend Uploads
export const generateUploadUrl = mutation(async (ctx) => {
  return await ctx.storage.generateUploadUrl();
});

export const createPost = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    accountId: v.id("accounts"),
    content: v.string(),
    scheduledTime: v.number(),
    // 2. NEW: Accept Media Details
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
      mediaStorageIds: args.mediaStorageIds,
      mediaType: args.mediaType,
    });
  },
});

export const updateStatus = mutation({
  args: { 
    postId: v.id("posts"), 
    status: v.union(v.literal("draft"), v.literal("scheduled"), v.literal("published"), v.literal("failed")),
    scheduledTime: v.optional(v.number()) 
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.postId, {
      status: args.status,
      ...(args.scheduledTime ? { scheduledTime: args.scheduledTime } : {}),
    });
  },
});

// 3. UPDATED: Smart Deletion
export const deletePost = mutation({
  args: { postId: v.id("posts") },
  handler: async (ctx, args) => {
    const post = await ctx.db.get(args.postId);
    if (!post) return;

    // A. Clean up storage files (Save money/space)
    if (post.mediaStorageIds) {
      for (const id of post.mediaStorageIds) {
        await ctx.storage.delete(id);
      }
    }

    // B. If published, trigger remote delete
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
    
    // C. Delete from DB
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

// 4. NEW: Helper for Action to get Public URL
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

export const markAsArchived = internalMutation({
  args: { postId: v.id("posts") },
  handler: async (ctx, args) => {
    // Changing status to 'archived' removes it from the Cron Job query
    // because the Cron only looks for status="published"
    await ctx.db.patch(args.postId, {
      status: "archived" as any // Type cast if 'archived' isn't in your original schema union
      // If you want to be strict, update schema.ts to include v.literal("archived")
    });
    console.log(`🗄️ Post ${args.postId} marked as archived (stop tracking).`);
  }
});

// Keep your Cron logic here...
export const publishDuePosts = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const scheduled = await ctx.db.query("posts").withIndex("by_status", q=>q.eq("status", "scheduled")).collect();
    const due = scheduled.filter(p => p.scheduledTime <= now);
    for (const post of due) {
        await ctx.scheduler.runAfter(0, internal.SocialActions.publishPost, { postId: post._id });
    }
  },
});