import { query, internalQuery } from "./_generated/server";
import { v } from "convex/values";

// PUBLIC: Used by the Frontend (Composer, Dashboard)
export const getByWorkspace = query({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("accounts")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .collect();
  },
});

// INTERNAL: Used by Actions (Posting to API) & Crons
export const getAccountInternal = internalQuery({
  args: { accountId: v.id("accounts") },
  handler: async (ctx, args) => {
    const account = await ctx.db.get(args.accountId);
    if (!account) throw new Error("Account not found");
    return account;
  },
});

// INTERNAL: Used by Analytics Cron
export const getAllInternal = internalQuery({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("accounts").collect();
  },
});