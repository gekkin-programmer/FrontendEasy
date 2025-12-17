import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // 1. USERS
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

  // 2. WORKSPACES
  workspaces: defineTable({
    name: v.string(),
    ownerId: v.string(),
    members: v.array(v.string()),
    roles: v.optional(v.any()), // Map user IDs to Roles
    plan: v.optional(v.string()),
  }),

  // 3. ACCOUNTS (Social Connections)
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

  // 4. POSTS
  posts: defineTable({
    workspaceId: v.id("workspaces"),
    accountId: v.id("accounts"),
    content: v.string(),
    
    // MEDIA
    mediaStorageIds: v.optional(v.array(v.id("_storage"))), 
    mediaType: v.optional(v.union(v.literal("image"), v.literal("video"))),

    // METADATA
    category: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),

    // STATUS
    status: v.union(
      v.literal("draft"), 
      v.literal("scheduled"), 
      v.literal("published"), 
      v.literal("failed"),
      v.literal("archived")
    ),
    scheduledTime: v.number(), 
    publishedTime: v.optional(v.number()),
    
    // EXTERNAL API
    publishedRemoteId: v.optional(v.string()),
    failureReason: v.optional(v.string()),

    // CACHED STATS
    currentStats: v.optional(v.object({
      likes: v.number(),
      comments: v.number(),
      shares: v.number(),
      impressions: v.number(),
    })),
  })
  .index("by_workspace", ["workspaceId"])
  .index("by_status", ["status"])
  .index("by_status_published", ["status", "publishedTime"]),

  // 5. TEAM CHAT
  team_messages: defineTable({
    workspaceId: v.id("workspaces"),
    senderId: v.string(),
    senderName: v.string(),
    content: v.string(),
    timestamp: v.number(),
    type: v.union(v.literal("chat"), v.literal("activity")),
  }).index("by_workspace", ["workspaceId"]),

  // 6. ENGAGEMENT (Inbox)
  engagements: defineTable({
    workspaceId: v.id("workspaces"),
    accountId: v.id("accounts"),
    platform: v.string(),
    type: v.string(),
    externalId: v.string(),
    
    // Author
    authorName: v.string(),
    authorHandle: v.string(),
    authorAvatar: v.optional(v.string()),
    
    // Content
    content: v.string(),
    originalPostContent: v.optional(v.string()),
    
    // Status
    status: v.union(v.literal("unread"), v.literal("read"), v.literal("replied"), v.literal("archived")),
    sentiment: v.optional(v.string()),
    receivedAt: v.number(),
    
    // Threading
    aiSuggestions: v.optional(v.array(v.string())),
  })
  .index("by_workspace_status", ["workspaceId", "status"])
  .index("by_workspace", ["workspaceId"]),

  // 7. INVITATIONS
  invitations: defineTable({
    workspaceId: v.id("workspaces"),
    email: v.string(),
    inviterId: v.string(),
    role: v.string(),
    status: v.union(v.literal("pending"), v.literal("accepted")),
  }).index("by_email", ["email"]),

  // 8. INTERNAL COMMENTS (Post Threading)
  internal_comments: defineTable({
    postId: v.id("posts"),
    userId: v.string(),
    userName: v.string(),
    content: v.string(),
    resolved: v.boolean(),
    timestamp: v.number(),
  }).index("by_post", ["postId"]),

  // 9. NOTIFICATIONS
  notifications: defineTable({
    userId: v.string(),
    workspaceId: v.id("workspaces"),
    type: v.union(v.literal("mention"), v.literal("invite"), v.literal("approval")),
    message: v.string(),
    link: v.optional(v.string()),
    read: v.boolean(),
    timestamp: v.number(),
  }).index("by_user", ["userId"]),

  // 10. ANALYTICS HISTORY
  daily_metrics: defineTable({
    postId: v.id("posts"),
    timestamp: v.number(),
    likes: v.number(),
    comments: v.number(),
    shares: v.number(),
    impressions: v.number(),
  }).index("by_post", ["postId"]),
});