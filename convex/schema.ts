import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    name: v.string(),
    email: v.string(),
    image: v.optional(v.string()),
    isOnline: v.boolean(),
    createdAt: v.number(),
  }).index("by_clerkId", ["clerkId"]),

  chats: defineTable({
    name: v.string(),
    users: v.array(v.id("users")),
    image: v.optional(v.string()),
    isGroupchat: v.boolean(),
    lastMessageAt: v.optional(v.number()),
    lastMessageText: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_users", ["users"]),

  messages: defineTable({
    text: v.string(),
    senderId: v.id("users"),
    chatId: v.id("chats"),
    isRead: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_chatId", ["chatId"])
    .index("by_senderId", ["senderId"]),

  typing: defineTable({
    chatId: v.id("chats"),
    userId: v.id("users"),
    updatedAt: v.number(),
  })
    .index("by_chatId", ["chatId"])
    .index("by_user_chat", ["userId", "chatId"]),
});
