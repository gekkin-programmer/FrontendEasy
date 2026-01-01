import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// 1. GET COMMENTS FOR A POST
export const getComments = query({
  args: { postId: v.id("posts") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("internal_comments")
      .withIndex("by_post", (q) => q.eq("postId", args.postId))
      .order("desc") // Newest first
      .collect();
  },
});

// 2. ADD A NEW COMMENT
export const addComment = mutation({
  args: { 
    postId: v.id("posts"), 
    content: v.string() 
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    // Fetch user details to store name snapshot
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .first();

    await ctx.db.insert("internal_comments", {
      postId: args.postId,
      userId: identity.tokenIdentifier,
      userName: user?.name || identity.name || "Team Member",
      content: args.content,
      resolved: false,
      timestamp: Date.now(),
    });
  },
});

// 3. RESOLVE A COMMENT (Mark as done)
export const resolveComment = mutation({
  args: { commentId: v.id("internal_comments") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.commentId, { resolved: true });
  },
});