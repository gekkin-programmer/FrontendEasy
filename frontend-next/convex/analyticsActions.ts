"use node"; 
import { internalAction } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

export const fetchPostStats = internalAction({
  args: { 
    postId: v.id("posts"),
    platform: v.string(),
    remoteId: v.string(),
    accessToken: v.string() 
  },
  handler: async (ctx, args) => {
    const { platform, remoteId, accessToken } = args;
    let stats = { likes: 0, comments: 0, shares: 0, impressions: 0 };

    try {
      if (platform === "facebook") {
        const account = await ctx.runQuery(internal.accounts.getAccountByPost, { postId: args.postId });
        const pageId = account?.platformAccountId;
        
        if (!pageId) {
          console.error("❌ FB Error: Page ID missing in database for this account.");
          return;
        }

        // 1. EXCHANGE USER TOKEN FOR PAGE TOKEN
        // This is required to see "Impressions" and "Private" post data
        const pageTokenUrl = `https://graph.facebook.com/v21.0/${pageId}?fields=access_token&access_token=${accessToken}`;
        const pageTokenRes = await fetch(pageTokenUrl);
        const pageTokenData = await pageTokenRes.json();

        if (pageTokenData.error) {
          console.error(`❌ FB Token Exchange Error: ${pageTokenData.error.message}`);
          return;
        }
        const pageAccessToken = pageTokenData.access_token;

        // 2. FORMAT THE ID CORRECTLY
        // Combines your Page ID (6158...) with your Post Alias (pfbid...)
        const finalFbId = remoteId.includes('_') ? remoteId : `${pageId}_${remoteId}`;

        // 3. FETCH FULL ANALYTICS
        // Now including impressions.metric(post_impressions)
        const fields = [
          "id",
          "shares",
          "likes.summary(true)",
          "comments.summary(true)",
          "insights.metric(post_impressions)"
        ].join(",");

        const statsUrl = `https://graph.facebook.com/v21.0/${finalFbId}?fields=${fields}&access_token=${pageAccessToken}`;
        
        const res = await fetch(statsUrl);
        const data = await res.json();
        
        if (data.error) {
          console.error(`❌ FB API Data Error: ${data.error.message}`);
          return;
        }
        
        // 4. MAP DATA TO OBJECT
        stats.likes = data.likes?.summary?.total_count || 0;
        stats.comments = data.comments?.summary?.total_count || 0;
        stats.shares = data.shares?.count || 0;
        
        // Find the impressions value inside the insights array
        const impressionsData = data.insights?.data?.find((m: any) => m.name === "post_impressions");
        stats.impressions = impressionsData?.values?.[0]?.value || 0;

        console.log(`✅ Stats Sync: ${stats.likes} Likes, ${stats.impressions} Impressions for ${finalFbId}`);
      }

      // 5. SAVE SNAPSHOT
      await ctx.runMutation(internal.analytics.saveSnapshot, {
        postId: args.postId,
        stats
      });

    } catch (error) {
      console.error(`🚨 Critical System Error:`, error);
    }
  },
});