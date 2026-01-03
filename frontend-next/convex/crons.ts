import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";
import { internalMutation } from "./_generated/server";

const crons = cronJobs();

// 1. Publish Scheduled Posts (Runs every minute)
crons.interval(
  "publish-posts",
  { minutes: 1 },
  internal.posts.publishDuePosts
);

// 2. Track Engagement (Runs every minute)
crons.interval(
  "track-engagement",
  { minutes: 1 }, 
  internal.crons.runEngagementTracking
);

// 3. Analytics Engine logic
export const runEngagementTracking = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const twentyFourHoursAgo = now - (24 * 60 * 60 * 1000);
    const oneYearAgo = now - (365 * 24 * 60 * 60 * 1000);

    const activePosts = await ctx.db
      .query("posts")
      .withIndex("by_status_published", (q) => 
         q.eq("status", "published").gt("publishedTime", oneYearAgo)
      )
      .collect();

    let highPriorityCount = 0;
    let lowPriorityCount = 0;

    const postsToUpdate = activePosts.filter(post => {
      if (post.publishedTime === undefined) return false;

      // BUCKET 1: "Hot" Posts (< 24h old) -> Update every 1 minute
      if (post.publishedTime > twentyFourHoursAgo) {
        highPriorityCount++;
        return true;
      }
      
      // BUCKET 2: "Cold" Posts (> 24h old) -> Update once every 60 minutes
      const lastCheck = post.lastStatsUpdate ?? 0;
      if ((now - lastCheck) > (60 * 60 * 1000)) {
        lowPriorityCount++;
        return true;
      }

      return false;
    });

    console.log(`📊 Engagement Cron: ${highPriorityCount} live updates, ${lowPriorityCount} hourly checks.`);

    for (const post of postsToUpdate) {
      if (!post.publishedRemoteId) continue;

      const account = await ctx.db.get(post.accountId);
      if (!account || !account.accessToken) continue;

      // 1. Mark as "In-Progress" to prevent other crons from picking it up
      await ctx.db.patch(post._id, { 
        lastStatsUpdate: now 
      });

      // 2. Schedule the API action
      await ctx.scheduler.runAfter(0, internal.analyticsActions.fetchPostStats, {
        postId: post._id,
        platform: account.platform,
        remoteId: post.publishedRemoteId,
        accessToken: account.accessToken
      });
    }
  },
});

export default crons;
