import { query, mutation, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

// 1. GET INBOX
export const getEngagements = query({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("engagements")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .order("desc")
      .collect();
  },
});

// 2. MARK AS READ / ARCHIVED
export const updateStatus = mutation({
  args: { id: v.id("engagements"), status: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { status: args.status as any });
  },
});

// 3. REPLY (Triggers API Action)
export const reply = mutation({
  args: { engagementId: v.id("engagements"), text: v.string() },
  handler: async (ctx, args) => {
    const engagement = await ctx.db.get(args.engagementId);
    if (!engagement) throw new Error("Engagement not found");

    // Optimistic Update: Mark as replied immediately
    await ctx.db.patch(args.engagementId, { status: "replied" });

    // Schedule API call
    const account = await ctx.db.get(engagement.accountId);
    if (account) {
        await ctx.scheduler.runAfter(0, internal.engagementActions.replyToSocials, {
            platform: engagement.platform,
            accessToken: account.accessToken || "",
            externalId: engagement.externalId,
            text: args.text
        });
    }
  },
});

// --- DEV TOOL: SEED MOCK DATA ---
export const seedMockData = mutation({
  args: { workspaceId: v.id("workspaces"), accountId: v.id("accounts") },
  handler: async (ctx, args) => {
    // Adds the mock data from your UI into the real DB
    await ctx.db.insert("engagements", {
        workspaceId: args.workspaceId,
        accountId: args.accountId,
        platform: "twitter",
        type: "mention",
        externalId: "mock_1",
        authorName: "Sarah Chen",
        authorHandle: "@sarahchen",
        authorAvatar: "SC",
        content: "Just discovered @easypost! Game changer! 🚀",
        status: "unread",
        sentiment: "positive",
        receivedAt: Date.now(),
        aiSuggestions: ["Thanks Sarah! 💙", "Glad to have you!"]
    });
    // Add more if you want...
  }
});