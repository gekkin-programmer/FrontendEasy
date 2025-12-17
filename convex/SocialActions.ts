"use node"; 
import { internalAction } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

// 1. DELETE
export const deleteExternalPost = internalAction({
  args: {
    platform: v.string(),
    accessToken: v.string(),
    remoteId: v.string(),
  },
  handler: async (ctx, args) => {
    const { platform, accessToken, remoteId } = args;
    try {
      if (platform === "facebook") {
        await fetch(`https://graph.facebook.com/v19.0/${remoteId}?access_token=${accessToken}`, { method: "DELETE" });
      }
      // Add other platforms if needed
    } catch (e) {
      console.error("Delete failed", e);
    }
  },
});

// 2. PUBLISH
export const publishPost = internalAction({
  args: { postId: v.id("posts") },
  handler: async (ctx, args) => {
    const post = await ctx.runQuery(internal.posts.getPostById, { postId: args.postId });
    if (!post) return;
    const account = await ctx.runQuery(internal.accounts.getAccountById, { accountId: post.accountId });
    if (!account || !account.accessToken) return;

    try {
      // A. GET MEDIA URL
      let mediaUrl: string | null = null;
      if (post.mediaStorageIds && post.mediaStorageIds.length > 0) {
        // Use the new internal helper
        mediaUrl = await ctx.runQuery(internal.posts.getImageUrl, { storageId: post.mediaStorageIds[0] });
      }

      let remoteId = "";
      const baseUrl = `https://graph.facebook.com/v19.0/${account.platformAccountId}`;

      // B. FACEBOOK LOGIC
      if (account.platform === "facebook") {
        if (mediaUrl) {
           // IMAGE/VIDEO
           const endpoint = post.mediaType === 'video' ? 'videos' : 'photos';
           const params = new URLSearchParams();
           
           if (post.mediaType === 'video') params.append("file_url", mediaUrl);
           else params.append("url", mediaUrl);
           
           if (post.content) params.append(post.mediaType === 'video' ? "description" : "message", post.content);
           params.append("access_token", account.accessToken);

           const res = await fetch(`${baseUrl}/${endpoint}`, { method: "POST", body: params });
           const data = await res.json();
           if (data.error) throw new Error(data.error.message);
           remoteId = data.post_id || data.id;
        } else {
           // TEXT
           const params = new URLSearchParams();
           params.append("message", post.content);
           params.append("access_token", account.accessToken);
           const res = await fetch(`${baseUrl}/feed`, { method: "POST", body: params });
           const data = await res.json();
           if (data.error) throw new Error(data.error.message);
           remoteId = data.id;
        }
      }

      await ctx.runMutation(internal.posts.markAsPublished, { postId: args.postId, remoteId: String(remoteId) });
    } catch (error: any) {
      console.error("Publish Error:", error);
      await ctx.runMutation(internal.posts.markAsFailed, { postId: args.postId, reason: error.message });
    }
  },
});