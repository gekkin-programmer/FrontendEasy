// convex/users.ts
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// 1. SYNC USER (Called on login)
export const store = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Called storeUser without authentication present");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();

    if (user !== null) {
      return user._id;
    }

    return await ctx.db.insert("users", {
      tokenIdentifier: identity.tokenIdentifier,
      name: identity.name || "Anonymous",
      email: identity.email,
      // Initialize default preferences
      preferences: {
        emailAlerts: true,
        failedPostAlerts: true,
        marketingEmails: false
      }
    });
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

// 3. UPDATE PROFILE (Name, Bio, etc.)
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