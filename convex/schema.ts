// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Sync Clerk users here via webhooks or just store refs
  users: defineTable({
    tokenIdentifier: v.string(), // Clerk ID
    name: v.optional(v.string()),
    email: v.optional(v.string()),
  }).index("by_token", ["tokenIdentifier"]),

  // Workspaces (e.g., "Agency A", "Personal Brand")
  workspaces: defineTable({
    name: v.string(),
    ownerId: v.string(), // Clerk ID
    members: v.array(v.string()), // Array of User IDs
    // --- ADDED THIS FIELD ---
    plan: v.optional(v.union(v.literal("free"), v.literal("pro"), v.literal("agency"))),
  }),

  // Social Accounts connected to a workspace
  accounts: defineTable({
    workspaceId: v.id("workspaces"),
    platform: v.union(v.literal("twitter"), v.literal("linkedin"), v.literal("instagram")),
    platformUsername: v.string(),
    avatarUrl: v.optional(v.string()),
    // CRITICAL: Never return tokens to the client. Keep them server-side only.
    accessToken: v.string(), 
    refreshToken: v.optional(v.string()),
    tokenExpiresAt: v.optional(v.number()),
  }).index("by_workspace", ["workspaceId"]),

  // The actual content to be posted
  posts: defineTable({
    workspaceId: v.id("workspaces"),
    projectId: v.optional(v.id("projects")), // Optional organization layer
    accountId: v.id("accounts"),
    content: v.string(),
    mediaStorageIds: v.optional(v.array(v.string())), // Images/Videos in Convex Storage
    status: v.union(
      v.literal("draft"), 
      v.literal("scheduled"), 
      v.literal("published"), 
      v.literal("failed")
    ),
    scheduledTime: v.number(), // Unix timestamp
    publishedTime: v.optional(v.number()),
  })
  .index("by_workspace", ["workspaceId"])
  .index("by_status", ["status"]), 

  // 1. Account Growth Over Time
  analytics_account_daily: defineTable({
    accountId: v.id("accounts"),
    date: v.string(), // ISO Date "2023-10-27"
    followers: v.number(),
    impressions: v.number(),
    profileViews: v.number(),
    platformData: v.any(), 
  }).index("by_account_date", ["accountId", "date"]),

  // 2. Post Performance Snapshots
  analytics_post_snapshots: defineTable({
    postId: v.id("posts"),
    timestamp: v.number(), // When did we check?
    likes: v.number(),
    comments: v.number(),
    shares: v.number(),
    clicks: v.number(),
    engagementRate: v.number(), // Calculated field
  }).index("by_post", ["postId"]),
});