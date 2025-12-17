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

// 2. Track Engagement (Runs every hour)
// This replaces the old 'triggerDailySync'
crons.interval(
  "track-engagement",
  { hours: 1 }, 
  internal.crons.runEngagementTracking
);

// 3. The Logic to Find Active Posts
export const runEngagementTracking = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    // Calculate 365 days ago in milliseconds
    const oneYearAgo = now - (365 * 24 * 60 * 60 * 1000);

    // Find posts that are Published AND newer than 1 year
    // We use the index 'by_status_published' we added to schema.ts
    const activePosts = await ctx.db
      .query("posts")
      .withIndex("by_status_published", (q) => 
         q.eq("status", "published").gt("publishedTime", oneYearAgo)
      )
      .collect();

    console.log(`📊 Tracking analytics for ${activePosts.length} active posts...`);

    // Loop through posts and trigger the fetch action for each
    for (const post of activePosts) {
      // Skip if no remote ID (means it wasn't successfully posted to API)
      if (!post.publishedRemoteId) continue;

      const account = await ctx.db.get(post.accountId);
      
      // Skip if account deleted or disconnected
      if (!account || !account.accessToken) continue;

      // Schedule the API call (Background job)
      await ctx.scheduler.runAfter(0, internal.analyticsActions.fetchPostStats,  {
        postId: post._id,
        platform: account.platform,
        remoteId: post.publishedRemoteId,
        accessToken: account.accessToken
      });
    }
  },
});

export default crons;
