import { internalMutation, query } from "./_generated/server";
import { v } from "convex/values";

// 1. MUTATION: Save the Snapshot to DB (Called by Cron Job)
export const saveSnapshot = internalMutation({
  args: {
    postId: v.id("posts"),
    stats: v.object({
      likes: v.number(),
      comments: v.number(),
      shares: v.number(),
      impressions: v.number(),
    })
  },
  handler: async (ctx, args) => {
    // A. Add a new row to history (for trends over time)
    await ctx.db.insert("daily_metrics", {
      postId: args.postId,
      timestamp: Date.now(),
      likes: args.stats.likes,
      comments: args.stats.comments,
      shares: args.stats.shares,
      impressions: args.stats.impressions,
    });

    // B. Update the main post object (for fast feed access)
    await ctx.db.patch(args.postId, {
      currentStats: args.stats
    });
  },
});

// 2. PUBLIC QUERY: Get History for a Single Post (For Post Details)
export const getPostHistory = query({
  args: { postId: v.id("posts") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("daily_metrics")
      .withIndex("by_post", (q) => q.eq("postId", args.postId))
      .order("desc")
      .take(30);
  },
});

// 3. PUBLIC QUERY: Get Aggregate Workspace Stats (For Dashboard Page)
export const getWorkspaceStats = query({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, args) => {
    // A. Get all posts for this workspace
    const posts = await ctx.db
      .query("posts")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .collect();

    const postIds = new Set(posts.map(p => p._id));

    // B. Calculate Totals (Current Snapshot)
    let totals = { likes: 0, comments: 0, shares: 0, posts: posts.length };
    
    // Sum up the 'currentStats' cached on the post objects
    for (const post of posts) {
        if (post.currentStats) {
            totals.likes += post.currentStats.likes;
            totals.comments += post.currentStats.comments;
            totals.shares += post.currentStats.shares;
        }
    }

    // C. Get History for Charting (Last 100 entries)
    // In production, you would use a dedicated aggregation table for performance.
    const recentMetrics = await ctx.db
        .query("daily_metrics")
        .order("desc")
        .take(100);

    // Filter metrics that belong to this workspace's posts
    // and reverse them so the chart goes Left->Right (Old->New)
    const chartData = recentMetrics
        .filter(m => postIds.has(m.postId))
        .map(m => ({
            timestamp: m.timestamp,
            likes: m.likes,
            comments: m.comments
        }))
        .reverse();

    return { totals, chartData };
  },
});