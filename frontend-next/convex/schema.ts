import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    tokenIdentifier: v.string(),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    username: v.optional(v.string()),
    bio: v.optional(v.string()),
    preferences: v.optional(v.object({
      emailAlerts: v.boolean(),
      failedPostAlerts: v.boolean(),
      marketingEmails: v.boolean(),
    })),
  }).index("by_token", ["tokenIdentifier"]),

  workspaces: defineTable({
    name: v.string(),
    ownerId: v.string(),
    members: v.array(v.string()),
    plan: v.optional(v.string()),
  }),

  accounts: defineTable({
    workspaceId: v.id("workspaces"),
    platform: v.string(), 
    platformAccountId: v.optional(v.string()), 
    platformUsername: v.string(),
    avatarUrl: v.optional(v.string()),
    accessToken: v.optional(v.string()), 
    refreshToken: v.optional(v.string()),
    tokenExpiresAt: v.optional(v.number()),
    credentials: v.optional(v.object({
      botToken: v.string(),
      chatId: v.string(),
    })),
    metadata: v.optional(v.any()),
  }).index("by_workspace", ["workspaceId"]),

  posts: defineTable({
    workspaceId: v.id("workspaces"),
    accountId: v.id("accounts"),
    content: v.string(),
    
    // MEDIA HANDLING
    mediaStorageIds: v.optional(v.array(v.id("_storage"))), 
    mediaType: v.optional(v.union(v.literal("image"), v.literal("video"))),

    // STATUS & SCHEDULING
    status: v.union(
      v.literal("draft"), 
      v.literal("scheduled"), 
      v.literal("published"), 
      v.literal("failed"),
      v.literal("archived")
    ),
    scheduledTime: v.number(), 
    publishedTime: v.optional(v.number()), // Needed for the 365-day tracking window
    
    // EXTERNAL API DATA
    publishedRemoteId: v.optional(v.string()),
    failureReason: v.optional(v.string()),

    // NEW: LIVE STATS CACHE (For quick display in Feed/Grid)
    currentStats: v.optional(v.object({
      likes: v.number(),
      comments: v.number(),
      shares: v.number(),
      impressions: v.number(),
    })),
  })
  .index("by_workspace", ["workspaceId"])
  .index("by_status", ["status"])
  // NEW INDEX: Optimized for the Cron Job to find active, published posts quickly
  .index("by_status_published", ["status", "publishedTime"]),

  // NEW TABLE: ANALYTICS HISTORY
  // Stores a snapshot of a post's stats at a specific point in time
  daily_metrics: defineTable({
    postId: v.id("posts"),
    timestamp: v.number(), // When this snapshot was taken
    likes: v.number(),
    comments: v.number(),
    shares: v.number(),
    impressions: v.number(),
  }).index("by_post", ["postId"]), // Fast lookup for charts
});