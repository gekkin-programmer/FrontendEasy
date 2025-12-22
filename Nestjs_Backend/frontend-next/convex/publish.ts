// convex/publish.ts
import { action } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

export const publishNow = action({
  args: {
    postId: v.id("posts"),
  },
  handler: async (ctx, args) => {
    // 1. Fetch Post (Internal)
    const post = await ctx.runQuery(internal.posts.getPostById, { postId: args.postId });
    
    if (!post) throw new Error("Post not found");
    if (post.status === "published") throw new Error("Already published");

    // 2. Fetch Account (Internal)
    const account = await ctx.runQuery(internal.accounts.getAccountInternal, { accountId: post.accountId });
    
    if (!account || !account.accessToken) throw new Error("Account disconnected or missing token");

    // 3. Router
    let resultId = "";

    try {
        if (account.platform === "facebook") {
            resultId = await publishToFacebook(account, post);
        } else if (account.platform === "instagram") {
            resultId = await publishToInstagram(account, post);
        } else {
            throw new Error(`Platform ${account.platform} not supported yet`);
        }

        // 4. Success (Internal)
        await ctx.runMutation(internal.posts.markAsPublished, {
            postId: args.postId,
            remoteId: resultId
        });

        return { success: true, id: resultId };

    } catch (error: any) {
        // 5. Failure (Internal)
        await ctx.runMutation(internal.posts.markAsFailed, {
            postId: args.postId,
            reason: error.message
        });
        throw new Error(error.message);
    }
  },
});

async function publishToFacebook(account: any, post: any) {
    const url = `https://graph.facebook.com/v18.0/${account.platformAccountId}/feed`;
    const params = new URLSearchParams({
        access_token: account.accessToken,
        message: post.content,
    });
    const res = await fetch(url, { method: "POST", body: params });
    const data = await res.json();
    if (data.error) throw new Error("FB API Error: " + data.error.message);
    return data.id; 
}

async function publishToInstagram(account: any, post: any) {
    const imageUrl = "https://placehold.co/600x400"; 
    
    // Step A
    const createUrl = `https://graph.facebook.com/v18.0/${account.platformAccountId}/media`;
    const containerParams = new URLSearchParams({
        access_token: account.accessToken,
        image_url: imageUrl, 
        caption: post.content,
    });
    const containerRes = await fetch(createUrl, { method: "POST", body: containerParams });
    const containerData = await containerRes.json();
    if (containerData.error) throw new Error("IG Container Error: " + containerData.error.message);
    
    // Step B
    const publishUrl = `https://graph.facebook.com/v18.0/${account.platformAccountId}/media_publish`;
    const publishParams = new URLSearchParams({
        access_token: account.accessToken,
        creation_id: containerData.id,
    });
    const publishRes = await fetch(publishUrl, { method: "POST", body: publishParams });
    const publishData = await publishRes.json();
    if (publishData.error) throw new Error("IG Publish Error: " + publishData.error.message);

    return publishData.id;
}