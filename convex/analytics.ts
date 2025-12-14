// convex/analytics.ts
import { internalAction, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

// 1. The Coordinator: Finds all accounts and schedules updates
export const triggerDailySync = internalAction({
  args: {},
  handler: async (ctx) => {
    // In a real app, paginate this or use a queue if you have 10k+ accounts
    const accounts = await ctx.runQuery(internal.accounts.getAllInternal);
    
    for (const account of accounts) {
      await ctx.runAction(internal.analytics.syncAccountStats, { 
        accountId: account._id 
      });
    }
  },
});

// 2. The Worker: Fetches data for ONE account
export const syncAccountStats = internalAction({
  args: { accountId: v.id("accounts") },
  handler: async (ctx, args) => {
    const account = await ctx.runQuery(internal.accounts.getAccountInternal, { accountId: args.accountId });
    
    // FETCH EXTERNAL DATA
    // Example: Fetch Twitter User Metrics
    let stats = { followers: 0, impressions: 0 };
    if (account.platform === "twitter") {
       // const data = await fetch(`https://api.twitter.com/2/users/${id}/metrics`, ...);
       // stats = data...
    }

    // SAVE TO DB
    await ctx.runMutation(internal.analytics.saveDailySnapshot, {
      accountId: args.accountId,
      stats,
      date: new Date().toISOString().split('T')[0] // "2023-10-27"
    });
  }
});

// 3. The Saver: Writes to the DB
export const saveDailySnapshot = internalMutation({
  args: { accountId: v.id("accounts"), stats: v.any(), date: v.string() },
  handler: async (ctx, args) => {
    // Upsert (Update if exists, Insert if new) logic to prevent duplicates
    const existing = await ctx.db
      .query("analytics_account_daily")
      .withIndex("by_account_date", q => q.eq("accountId", args.accountId).eq("date", args.date))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, { ...args.stats });
    } else {
      await ctx.db.insert("analytics_account_daily", {
        accountId: args.accountId,
        date: args.date,
        ...args.stats
      });
    }
  }
});