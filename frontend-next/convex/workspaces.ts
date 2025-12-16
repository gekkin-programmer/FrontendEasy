// convex/workspaces.ts
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// 1. SECURE CREATE MUTATION
export const create = mutation({
  args: { 
    name: v.string(),
    // We make plan optional, defaulting to "free" if not provided
    plan: v.optional(v.string()) 
  },
  handler: async (ctx, args) => {
    // Security: Check if user is logged in
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized: You must be logged in to create a workspace.");
    }

    // Insert with the authenticated user's ID
    const workspaceId = await ctx.db.insert("workspaces", {
      name: args.name,
      ownerId: identity.subject, // 'subject' is the Clerk User ID
      members: [identity.subject], // Add owner to members array
      plan: (args.plan as any) || "free", 
    });

    return workspaceId;
  },
});

// 2. SECURE QUERY (Replaces getAll)
export const getMyWorkspaces = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    
    // If not logged in, return empty array (don't throw error, just show nothing)
    if (!identity) return [];

    // Fetch all workspaces
    // Note: As you scale, you might want a separate "members" table for performance.
    // For now, filtering the array is fast enough.
    const allWorkspaces = await ctx.db.query("workspaces").collect();
    
    // Only return workspaces where the user is a member
    return allWorkspaces.filter((w) => w.members.includes(identity.subject));
  },
});

// 3. GET SINGLE WORKSPACE (For Dashboard Layout)
export const getById = query({
  args: { id: v.id("workspaces") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const workspace = await ctx.db.get(args.id);
    
    // Security: Ensure user is actually a member of this workspace
    if (!workspace || !workspace.members.includes(identity.subject)) {
      return null;
    }

    return workspace;
  },
});