import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getAll = query({
  args: {},
  handler: async (ctx) => {
    // In a real app, filtering by user happens here:
    // const identity = await ctx.auth.getUserIdentity();
    // return await ctx.db.query("workspaces").filter(q => q.eq(q.field("ownerId"), identity.subject)).collect();
    
    // For now, return all (dev mode):
    return await ctx.db.query("workspaces").collect();
  },
});

export const create = mutation({
  args: { name: v.string(), ownerId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db.insert("workspaces", {
      name: args.name,
      ownerId: args.ownerId,
      members: [args.ownerId],
    });
  },
});