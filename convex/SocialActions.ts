// convex/socialActions.ts
import { action } from "./_generated/server";
import { v } from "convex/values";
import { internal, api } from "./_generated/api"; // <--- 1. Make sure 'api' is imported

export const publishPost = action({
  args: { postId: v.id("posts") },
  handler: async (ctx, args) => {
    // 1. Fetch post details (Internal is fine here)
    const post = await ctx.runQuery(internal.posts.getPostInternal, { postId: args.postId });
    
    // Safety check
    if (!post) return;

    const account = await ctx.runQuery(internal.accounts.getAccountInternal, { accountId: post.accountId });

    try {
      console.log(`Publishing post ${post._id} to ${account.platform}...`);
      
      // ... (Your generic API fetch logic here) ...
      
      // 2. Update status to 'published'
      // FIX: Use 'api.posts.updateStatus' instead of 'internal.posts.updateStatus'
      await ctx.runMutation(api.posts.updateStatus, { 
        postId: args.postId, 
        status: "published" 
      });

    } catch (error) {
      // FIX: Use 'api.posts.updateStatus' here too
      await ctx.runMutation(api.posts.updateStatus, { 
        postId: args.postId, 
        status: "failed" 
      });
    }
  },
});