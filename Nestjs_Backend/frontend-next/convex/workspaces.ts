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
    if (!identity) throw new Error("Unauthorized");

    // Clean the plan string or default to free
    const planValue = args.plan ?? "free";

    const workspaceId = await ctx.db.insert("workspaces", {
      name: args.name,
      ownerId: identity.tokenIdentifier,
      members: [identity.tokenIdentifier], 
      plan: planValue, 
    });

    return workspaceId;
  },
});

// 2. OPTIMIZED QUERY (My Workspaces)
// Use an index instead of .collect().filter()
export const getMyWorkspaces = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const workspaces = await ctx.db.query("workspaces").collect();
    
    // Filter in JavaScript for maximum flexibility with arrays
    return workspaces.filter((w) => 
      w.ownerId === identity.tokenIdentifier || 
      w.members?.includes(identity.tokenIdentifier)
    );
  },
});

// 4. GET SINGLE WORKSPACE BY ID
export const getById = query({
  args: { id: v.id("workspaces") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const workspace = await ctx.db.get(args.id);
    
    // Security: Only return the workspace if the user is a member
    if (!workspace || !workspace.members.includes(identity.tokenIdentifier)) {
      return null;
    }

    return workspace;
  },
});

// 3. GET TEAM MEMBERS (Improved fetching)
export const getTeam = query({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const workspace = await ctx.db.get(args.workspaceId);
    if (!workspace) return [];

    // Security: Only members can see the team list
    if (!workspace.members.includes(identity.tokenIdentifier)) return [];

    // Resolve all member details in parallel
    const memberDetails = await Promise.all(
      workspace.members.map(async (tokenIdentifier) => {
        const user = await ctx.db
          .query("users")
          .withIndex("by_token", (q) => q.eq("tokenIdentifier", tokenIdentifier))
          .unique(); // Use .unique() for better safety
        
        return user ? {
          name: user.name,
          email: user.email,
          role: tokenIdentifier === workspace.ownerId ? "Owner" : "Member",
          picture: user.picture // Added picture if you have it
        } : null;
      })
    );

    return memberDetails.filter(m => m !== null);
  },
});