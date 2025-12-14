// convex/posts.ts
import { query, mutation, internalMutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";

// 1. PUBLIC QUERIES

export const getWorkspacePosts = query({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("posts")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .order("desc") // Newest first
      .collect();
  },
});

// 2. PUBLIC MUTATIONS

export const createPost = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    accountId: v.id("accounts"),
    content: v.string(),
    scheduledTime: v.number(), // Unix timestamp
  },
  handler: async (ctx, args) => {
    // Logic: Determine status based on time. 
    // If time is in the past/now, it's 'published' (conceptually), otherwise 'scheduled'.
    const status = "scheduled"; 

    const postId = await ctx.db.insert("posts", {
      workspaceId: args.workspaceId,
      accountId: args.accountId,
      content: args.content,
      scheduledTime: args.scheduledTime,
      status: status,
    });

    // TODO: In the future, this is where you call ctx.scheduler.runAt() 
    // to trigger the actual social media publishing action.

    return postId;
  },
});

export const updateStatus = mutation({
  args: { 
    postId: v.id("posts"), 
    status: v.union(
      v.literal("draft"), 
      v.literal("scheduled"), 
      v.literal("published"), 
      v.literal("failed")
    ),
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
    await ctx.db.delete(args.postId);
  },
});

// 3. INTERNAL (For Background Actions)

export const getPostInternal = internalQuery({
  args: { postId: v.id("posts") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.postId);
  },
});