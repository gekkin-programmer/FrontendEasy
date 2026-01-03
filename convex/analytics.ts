import { internalMutation, query } from "./_generated/server";
import { v } from "convex/values";

// 1. MUTATION: Save the Snapshot to DB (Called by Cron Job)
// convex/analytics.ts

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
    const now = Date.now();
    const oneHourAgo = now - (60 * 60 * 1000);

    // 1. Update the main post object (This keeps the 1-minute live updates visible)
    await ctx.db.patch(args.postId, {
      currentStats: args.stats,
      lastStatsUpdate: now,
    });

    // 2. CHECK: Do we already have a history entry for this post from the last hour?
    const recentHistory = await ctx.db
      .query("daily_metrics")
      .withIndex("by_post", (q) => q.eq("postId", args.postId))
      .order("desc")
      .first();

    // 3. Only insert into history if the last entry is older than 1 hour
    // This prevents the DB from filling up with 1-minute duplicates
    if (!recentHistory || recentHistory.timestamp < oneHourAgo) {
      await ctx.db.insert("daily_metrics", {
        postId: args.postId,
        timestamp: now,
        likes: args.stats.likes,
        comments: args.stats.comments,
        shares: args.stats.shares,
        impressions: args.stats.impressions,
      });
    }
  },
});

// 5. QUERY: Niche Performance (Group by Category)
export const getNichePerformance = query({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, args) => {
    const posts = await ctx.db
      .query("posts")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .collect();

    const categoryStats: Record<string, { totalLikes: number; count: number; avg: number }> = {};
    const tagStats: Record<string, { totalLikes: number; count: number }> = {};

    for (const post of posts) {
      if (!post.currentStats) continue;
      
      const likes = post.currentStats.likes;
      const cat = post.category || "Uncategorized";

      // 1. Aggregate Categories
      if (!categoryStats[cat]) categoryStats[cat] = { totalLikes: 0, count: 0, avg: 0 };
      categoryStats[cat].totalLikes += likes;
      categoryStats[cat].count += 1;

      // 2. Aggregate Hashtags
      if (post.tags) {
        for (const tag of post.tags) {
          if (!tagStats[tag]) tagStats[tag] = { totalLikes: 0, count: 0 };
          tagStats[tag].totalLikes += likes;
          tagStats[tag].count += 1;
        }
      }
    }

    // Calculate Averages & Format for Chart
    const categories = Object.entries(categoryStats).map(([name, data]) => ({
      name,
      posts: data.count,
      avgLikes: Math.round(data.totalLikes / data.count)
    })).sort((a, b) => b.avgLikes - a.avgLikes); // Best performing first

    const topTags = Object.entries(tagStats)
      .map(([tag, data]) => ({ tag, count: data.count, totalLikes: data.totalLikes }))
      .sort((a, b) => b.totalLikes - a.totalLikes)
      .slice(0, 5); // Top 5 tags

    return { categories, topTags };
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
    const posts = await ctx.db
      .query("posts")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .collect();

    let totals = { likes: 0, comments: 0, shares: 0, posts: posts.length };
    
    // Process totals
    for (const post of posts) {
      if (post.currentStats) {
        totals.likes += post.currentStats.likes;
        totals.comments += post.currentStats.comments;
        totals.shares += post.currentStats.shares;
      }
    }

    // Process Chart Data: Get the last 50 snapshots for the most recent post
    // or aggregate them. For a simple dashboard, we'll take the workspace's
    // latest metrics.
    const chartData = [];
    if (posts.length > 0) {
        const latestMetrics = await ctx.db
            .query("daily_metrics")
            .withIndex("by_post", (q) => q.eq("postId", posts[0]._id)) // Primary post trend
            .order("desc")
            .take(24); // Last 24 hours of history
        
        chartData.push(...latestMetrics.reverse());
    }

    return { totals, chartData };
  },
});