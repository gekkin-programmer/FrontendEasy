import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// 1. GET TEAM DATA (Members + Pending Invites)
export const getTeamData = query({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, args) => {
    const workspace = await ctx.db.get(args.workspaceId);
    if (!workspace) return { members: [], invites: [] };

    // A. Active Members
    const members = await Promise.all(
      workspace.members.map(async (memberId) => {
        const user = await ctx.db
          .query("users")
          .withIndex("by_token", (q) => q.eq("tokenIdentifier", memberId))
          .first();
        
        // Get Role from the Roles Map, default to 'Editor' if not found
        const role = workspace.roles?.[memberId] || (workspace.ownerId === memberId ? "Owner" : "Editor");

        return {
           id: memberId,
           name: user?.name || "Unknown",
           email: user?.email,
           role: role,
           avatar: user?.name?.charAt(0).toUpperCase() || "?"
        };
      })
    );

    // B. Pending Invites
    // Filtering manually for simplicity, but could be indexed
    const allInvites = await ctx.db.query("invitations").collect();
    const invites = allInvites.filter(inv => inv.workspaceId === args.workspaceId);

    return { members, invites };
  },
});

// 2. INVITE MEMBER (With Role Support)
export const inviteMember = mutation({
  args: { 
    workspaceId: v.id("workspaces"), 
    email: v.string(),
    role: v.string() // "Admin" | "Editor" | "Reviewer"
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    // Check if user already exists
    const existingUser = await ctx.db
      .query("users")
      .filter(q => q.eq(q.field("email"), args.email))
      .first();

    if (existingUser) {
      // SCENARIO A: User exists -> Add directly to Workspace
      const workspace = await ctx.db.get(args.workspaceId);
      if (workspace && !workspace.members.includes(existingUser.tokenIdentifier)) {
        
        // Add Member
        const newMembers = [...workspace.members, existingUser.tokenIdentifier];
        
        // Add Role
        const newRoles = { 
            ...(workspace.roles || {}), 
            [existingUser.tokenIdentifier]: args.role 
        };

        await ctx.db.patch(args.workspaceId, {
          members: newMembers,
          roles: newRoles
        });
        return { status: "joined", message: `${args.email} added to team as ${args.role}.` };
      }
      return { status: "error", message: "User already in team." };
    } 
    else {
      // SCENARIO B: User doesn't exist -> Create Pending Invite
      const existingInvite = await ctx.db
        .query("invitations")
        .withIndex("by_email", q => q.eq("email", args.email))
        .filter(q => q.eq(q.field("workspaceId"), args.workspaceId))
        .first();

      if (!existingInvite) {
        await ctx.db.insert("invitations", {
          workspaceId: args.workspaceId,
          email: args.email,
          inviterId: identity.tokenIdentifier,
          role: args.role, // Save intended role
          status: "pending"
        });
      }
      return { status: "invited", message: `Invite sent to ${args.email}.` };
    }
  }
});

// 3. REMOVE MEMBER
export const removeMember = mutation({
  args: { workspaceId: v.id("workspaces"), memberId: v.string() },
  handler: async (ctx, args) => {
    const workspace = await ctx.db.get(args.workspaceId);
    if (!workspace) return;

    // Filter out the member
    const newMembers = workspace.members.filter(m => m !== args.memberId);
    
    // Remove from Roles object
    const newRoles = { ...workspace.roles };
    delete newRoles[args.memberId];

    await ctx.db.patch(args.workspaceId, { 
        members: newMembers,
        roles: newRoles
    });
  }
});

// 4. UPDATE ROLE
export const updateRole = mutation({
  args: { workspaceId: v.id("workspaces"), memberId: v.string(), role: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    // Security Check: Only Owner can update roles (simplified)
    const ws = await ctx.db.get(args.workspaceId);
    if (!ws) throw new Error("Workspace not found");
    
    // In a real app, check if requester is Admin/Owner
    // For now, we assume anyone in the team can edit (or restricted by UI)
    
    const newRoles = { ...(ws.roles || {}), [args.memberId]: args.role };
    await ctx.db.patch(args.workspaceId, { roles: newRoles });
  }
});

// 5. REVOKE INVITE
export const revokeInvite = mutation({
  args: { inviteId: v.id("invitations") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.inviteId);
  }
});

// 6. CHAT: GET MESSAGES
export const getMessages = query({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("team_messages")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .order("desc") 
      .take(100);
  }
});

// 7. CHAT: SEND MESSAGE
export const sendMessage = mutation({
  args: { workspaceId: v.id("workspaces"), content: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .first();

    await ctx.db.insert("team_messages", {
        workspaceId: args.workspaceId,
        senderId: identity.tokenIdentifier,
        senderName: user?.name || identity.name || "Member",
        content: args.content,
        timestamp: Date.now(),
        type: "chat"
    });
  }
});