"use node";
import { internalAction } from "./_generated/server";
import { v } from "convex/values";

export const replyToSocials = internalAction({
  args: {
    platform: v.string(),
    accessToken: v.string(),
    externalId: v.string(), // The Comment ID to reply to
    text: v.string(),
  },
  handler: async (ctx, args) => {
    const { platform, accessToken, externalId, text } = args;

    try {
      if (platform === "facebook" || platform === "instagram") {
        // Graph API: POST /{comment_id}/comments
        const url = `https://graph.facebook.com/v19.0/${externalId}/comments`;
        await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: text, access_token: accessToken })
        });
      } 
      else if (platform === "linkedin") {
        // LinkedIn API: POST /socialActions/{urn}/comments
        const url = `https://api.linkedin.com/v2/socialActions/${encodeURIComponent(externalId)}/comments`;
        await fetch(url, {
            method: "POST",
            headers: { 
                "Authorization": `Bearer ${accessToken}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ 
                actor: "urn:li:person:YOUR_ID", // Simplified: Real app needs to store URN in account
                message: { text } 
            })
        });
      }
      // Add Twitter logic here...
      
      console.log(`✅ Replied to ${platform} comment: ${externalId}`);
    } catch (e) {
      console.error("Reply failed", e);
    }
  },
});