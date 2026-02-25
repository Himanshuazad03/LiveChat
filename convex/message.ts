import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const sendMessage = mutation({
  args: {
    chatId: v.id("chats"),
    text: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!currentUser) throw new Error("User not found");

    const now = Date.now();

    await ctx.db.insert("messages", {
      chatId: args.chatId,
      text: args.text,
      createdAt: now,
      senderId: currentUser._id,
      isRead: false,
    });

    await ctx.db.patch(args.chatId, {
      lastMessageText: args.text,
      lastMessageAt: now,
    });
  },
});

export const getMessages = query({
  args: {
    chatId: v.id("chats"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!currentUser) throw new Error("User not found");

    const messages = await ctx.db
      .query("messages")
      .withIndex("by_chatId", (q) => q.eq("chatId", args.chatId))
      .collect();

    const fullMessages = await Promise.all(
      messages.map(async (message) => {
        const sender = await ctx.db
          .query("users")
          .withIndex("by_id", (q) => q.eq("_id", message.senderId))
          .first();
        return { ...message, sender };
      }),
    );

    return fullMessages;
  },
});

export const markMessagesAsRead = mutation({
  args: {
    chatId: v.id("chats"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return;

    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!currentUser) return;

    const unreadMessages = await ctx.db
      .query("messages")
      .withIndex("by_chatId", (q) => q.eq("chatId", args.chatId))
      .filter((q) =>
        q.and(
          q.neq(q.field("senderId"), currentUser._id),
          q.eq(q.field("isRead"), false),
        ),
      )
      .collect();

    for (const msg of unreadMessages) {
      await ctx.db.patch(msg._id, { isRead: true });
    }
  },
});

export const setTyping = mutation({
  args: {
    chatId: v.id("chats"),
    isTyping: v.boolean(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!currentUser) throw new Error("User not found");

    const existing = await ctx.db
      .query("typing")
      .withIndex("by_user_chat", (q) =>
        q.eq("userId", currentUser._id).eq("chatId", args.chatId),
      )
      .unique();

    if (args.isTyping) {
      if (existing) {
        await ctx.db.patch(existing._id, {
          updatedAt: Date.now(),
        });
      } else {
        await ctx.db.insert("typing", {
          chatId: args.chatId,
          userId: currentUser._id,
          updatedAt: Date.now(),
        });
      }
    } else {
      if (existing) {
        await ctx.db.delete(existing._id);
      }
    }
  },
});

export const getTyping = query({
  args: {
    chatId: v.id("chats"),
  },
  handler: async (ctx, args) => {
    const threeSecondsAgo = Date.now() - 3000;

    const typingUsers = await ctx.db
      .query("typing")
      .withIndex("by_chatId", (q) => q.eq("chatId", args.chatId))
      .collect();

    const activeTyping = typingUsers.filter(
      (t) => t.updatedAt > threeSecondsAgo,
    );

    const results = await Promise.all(
      activeTyping.map(async (typing) => {
        const user = await ctx.db.get(typing.userId);

        return {
          userId: typing.userId,
          name: user?.name,
          image: user?.image,
        };
      }),
    );

    return results;
  },
});

export const deleteMessage = mutation({
  args: {
    messageId: v.id("messages"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!currentUser) throw new Error("User not found");

    const message = await ctx.db.get(args.messageId);
    if (!message) throw new Error("Message not found");

    if (message.senderId !== currentUser._id) {
      throw new Error("You can only delete your own messages");
    }

    await ctx.db.delete(args.messageId);
  },
});
