// convex/workspaces.ts
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// 1. SECURE CREATE MUTATION
export const create = mutation({
  args: { 
    name: v.string(),
    plan: v.optional(v.string()) 
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const workspaceId = await ctx.db.insert("workspaces", {
      name: args.name,
      ownerId: identity.tokenIdentifier, // Use tokenIdentifier for consistency with users table
      members: [identity.tokenIdentifier], 
      plan: (args.plan as any) || "free", 
    });

    return workspaceId;
  },
});

// 2. SECURE QUERY (My Workspaces)
export const getMyWorkspaces = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const allWorkspaces = await ctx.db.query("workspaces").collect();
    
    // Filter for workspaces where current user is a member
    return allWorkspaces.filter((w) => w.members.includes(identity.tokenIdentifier));
  },
});

// 3. GET SINGLE WORKSPACE
export const getById = query({
  args: { id: v.id("workspaces") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const workspace = await ctx.db.get(args.id);
    
    if (!workspace || !workspace.members.includes(identity.tokenIdentifier)) {
      return null;
    }

    return workspace;
  },
});

// 4. GET TEAM MEMBERS (For Settings Page)
export const getTeam = query({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, args) => {
    const workspace = await ctx.db.get(args.workspaceId);
    if (!workspace) return [];

    // In this MVP, we are storing members as an array of IDs string.
    // We need to fetch the User documents for these IDs.
    
    // 1. Fetch all users who are in the members list
    // Note: Convex doesn't have a "WHERE IN ARRAY" easily, so we iterate or fetch all.
    // For small teams, fetching logic here is fine.
    
    // Find the Owner
    const owner = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", workspace.ownerId))
      .first();
    
    // Return array (currently just owner until we add invite logic)
    const members = [];
    if (owner) {
        members.push({
            name: owner.name,
            email: owner.email,
            role: "Owner"
        });
    }

    return members;
  },
});