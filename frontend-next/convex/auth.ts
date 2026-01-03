"use node";
import { action } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

// 1. GENERATE LOGIN URL (This is where permissions live)
export const getAuthUrl = action({
  args: { platform: v.string(), workspaceId: v.string() },
  handler: async (ctx, args) => {
    const state = args.workspaceId; 
    const redirectUri = `${APP_URL}/integrations/callback`; // Ensure this matches Facebook Console

    // --- FACEBOOK CONFIG ---
    if (args.platform === "facebook") {
      const clientId = process.env.META_CLIENT_ID;
      
      // CRITICAL: These are the permissions you need
      const scopes = [
        "public_profile", 
        "pages_show_list", 
        "pages_read_engagement", // <--- Needed for Analytics (Likes/Comments)
        "pages_manage_posts",    // <--- Needed for Posting
        "read_insights"          // <--- Needed for Page Growth stats
      ].join(",");
      
      return `https://www.facebook.com/v19.0/dialog/oauth?client_id=${clientId}&redirect_uri=${redirectUri}&state=${state}&scope=${scopes}&response_type=code`;
    }

    // --- LINKEDIN CONFIG ---
    if (args.platform === "linkedin") {
      const clientId = process.env.LINKEDIN_CLIENT_ID;
      const scopes = ["w_member_social", "r_liteprofile", "openid", "profile", "email"].join(" ");
      
      return `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&state=${state}&scope=${scopes}`;
    }

    return null;
  },
});

// 2. EXCHANGE CODE FOR TOKEN (FACEBOOK)
export const exchangeFacebookCode = action({
  args: { code: v.string(), workspaceId: v.id("workspaces") },
  handler: async (ctx, args) => {
    const redirectUri = `${APP_URL}/integrations/callback`;

    // A. Exchange Code for User Token
    const tokenUrl = `https://graph.facebook.com/v19.0/oauth/access_token?client_id=${process.env.META_CLIENT_ID}&redirect_uri=${redirectUri}&client_secret=${process.env.META_CLIENT_SECRET}&code=${args.code}`;
    
    const tokenRes = await fetch(tokenUrl);
    const tokenData = await tokenRes.json();
    
    if (tokenData.error) throw new Error("FB Token Error: " + tokenData.error.message);
    const userAccessToken = tokenData.access_token;

    // B. Get User's Pages (We need the Page Token to post/read)
    const pagesUrl = `https://graph.facebook.com/v19.0/me/accounts?access_token=${userAccessToken}`;
    const pagesRes = await fetch(pagesUrl);
    const pagesData = await pagesRes.json();

    if (!pagesData.data || pagesData.data.length === 0) {
      throw new Error("No Facebook Pages found for this user.");
    }

    // C. Save the FIRST Page found (Or loop to save all)
    const page = pagesData.data[0]; 

    // D. Save to DB
    await ctx.runMutation(internal.accounts.saveAccount, {
      workspaceId: args.workspaceId,
      platform: "facebook",
      platformAccountId: page.id,
      platformUsername: page.name,
      accessToken: page.access_token, // This is the Page Token with permissions
      avatarUrl: `https://graph.facebook.com/${page.id}/picture?type=square`,
    });

    return { success: true, name: page.name };
  },
});

// 3. EXCHANGE CODE FOR TOKEN (LINKEDIN)
export const exchangeLinkedinCode = action({
  args: { code: v.string(), workspaceId: v.id("workspaces") },
  handler: async (ctx, args) => {
    const redirectUri = `${APP_URL}/integrations/callback`;

    const params = new URLSearchParams();
    params.append("grant_type", "authorization_code");
    params.append("code", args.code);
    params.append("redirect_uri", redirectUri);
    params.append("client_id", process.env.LINKEDIN_CLIENT_ID!);
    params.append("client_secret", process.env.LINKEDIN_CLIENT_SECRET!);

    const tokenRes = await fetch("https://www.linkedin.com/oauth/v2/accessToken", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params,
    });
    
    const tokenData = await tokenRes.json();
    if (tokenData.error) throw new Error(tokenData.error_description);
    const accessToken = tokenData.access_token;

    // Get Profile
    const meRes = await fetch("https://api.linkedin.com/v2/me", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const meData = await meRes.json();
    
    await ctx.runMutation(internal.accounts.saveAccount, {
      workspaceId: args.workspaceId,
      platform: "linkedin",
      platformAccountId: meData.id, 
      platformUsername: `${meData.localizedFirstName} ${meData.localizedLastName}`,
      accessToken: accessToken,
      avatarUrl: "", 
    });

    return { success: true };
  },
});