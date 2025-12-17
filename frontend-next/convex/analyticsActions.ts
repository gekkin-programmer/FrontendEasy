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
      // === FACEBOOK LOGIC ===
      if (platform === "facebook") {
        const fields = "likes.summary(true),comments.summary(true),shares";
        const url = `https://graph.facebook.com/v19.0/${remoteId}?fields=${fields}&access_token=${accessToken}`;
        
        const res = await fetch(url);
        const data = await res.json();
        
        // --- ERROR HANDLING ---
        if (data.error) {
            const code = data.error.code;
            // Code 100 = Object does not exist (Deleted)
            // Code 10 = Permission denied (or deleted)
            if (code === 100 || code === 10 || code === 21) {
                console.warn(`⚠️ Post ${remoteId} seems deleted on FB. Archiving local copy.`);
                
                // STOP TRACKING: Update DB so Cron doesn't check this again
                await ctx.runMutation(internal.posts.markAsArchived, { 
                    postId: args.postId 
                });
                return;
            }
            
            console.error(`❌ FB Analytics Error: ${data.error.message}`);
            return;
        }
        
        stats.likes = data.likes?.summary?.total_count || 0;
        stats.comments = data.comments?.summary?.total_count || 0;
        stats.shares = data.shares?.count || 0;
      }
      
      // ... (Keep LinkedIn logic same) ...

      // Success: Save Stats
      await ctx.runMutation(internal.analytics.saveSnapshot, {
        postId: args.postId,
        stats
      });

    } catch (error) {
      console.error(`System Error:`, error);
    }
  },
});