import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// 1. SYNC USER (Called on login/signup)
export const store = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Called storeUser without authentication present");
    }

    // A. Create/Update User Record
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();

    let userId = user?._id;

    if (user !== null) {
      // Update details if changed
      if (user.name !== identity.name || user.email !== identity.email) {
        await ctx.db.patch(user._id, { name: identity.name, email: identity.email });
      }
    } else {
      // Create new user
      userId = await ctx.db.insert("users", {
        tokenIdentifier: identity.tokenIdentifier,
        name: identity.name || "Anonymous",
        email: identity.email,
        preferences: {
          emailAlerts: true,
          failedPostAlerts: true,
          marketingEmails: false
        }
      });
    }

    // B. AUTO-JOIN LOGIC: Check for Pending Invites
    // If they were invited by email before signing up, add them now.
    if (identity.email) {
      const pendingInvites = await ctx.db
        .query("invitations")
        .withIndex("by_email", (q) => q.eq("email", identity.email!))
        .filter((q) => q.eq(q.field("status"), "pending"))
        .collect();

      for (const invite of pendingInvites) {
        const workspace = await ctx.db.get(invite.workspaceId);
        if (workspace) {
          // 1. Add to members list
          // Ensure no duplicates
          const newMembers = workspace.members.includes(identity.tokenIdentifier)
            ? workspace.members
            : [...workspace.members, identity.tokenIdentifier];

          // 2. Add Role mapping
          const newRoles = { 
            ...(workspace.roles || {}), 
            [identity.tokenIdentifier]: invite.role 
          };

          // 3. Update Workspace
          await ctx.db.patch(invite.workspaceId, { 
            members: newMembers,
            roles: newRoles
          });

          // 4. Mark invite as accepted
          await ctx.db.patch(invite._id, { status: "accepted" });
        }
      }
    }

    return userId;
  },
});

// 2. GET USER PROFILE
export const getUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();
    return user;
  },
});

// 3. UPDATE PROFILE
export const updateProfile = mutation({
  args: {
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    username: v.optional(v.string()),
    bio: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();

    if (!user) throw new Error("User not found");

    await ctx.db.patch(user._id, {
      name: args.name,
      email: args.email,
      username: args.username,
      bio: args.bio,
    });
  },
});

// 4. UPDATE NOTIFICATION PREFERENCES
export const updatePreferences = mutation({
  args: {
    emailAlerts: v.boolean(),
    failedPostAlerts: v.boolean(),
    marketingEmails: v.boolean(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();

    if (!user) throw new Error("User not found");

    await ctx.db.patch(user._id, {
      preferences: args,
    });
  },
});