import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const createOrGetChat = mutation({
  args: {
    otherUserId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");
    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!currentUser) throw new Error("User not found");

    // Check if conversation already exists
    const chats = await ctx.db.query("chats").collect();

    const existing = chats.find(
      (chat) =>
        chat.users.includes(currentUser._id) &&
        chat.users.includes(args.otherUserId),
    );

    if (existing) return existing._id;

    // Create new one
    return await ctx.db.insert("chats", {
      users: [currentUser._id, args.otherUserId],
      createdAt: Date.now(),
      name: "",
      isGroupchat: false,
    });
  },
});

export const getAllChats = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!currentUser) throw new Error("User not found");

    const chats = await ctx.db.query("chats").order("desc").collect();

    const filtered = chats.filter((chat) =>
      chat.users.includes(currentUser._id),
    );

    const chatsWithUsers = await Promise.all(
      filtered.map(async (chat) => {

        const Users = await Promise.all(
          chat.users.map((id) => ctx.db.get(id)),
        );
        const unreadMessages = await ctx.db
          .query("messages")
          .withIndex("by_chatId", (q) => q.eq("chatId", chat._id))
          .filter((q) =>
            q.and(
              q.eq(q.field("isRead"), false),
              q.neq(q.field("senderId"), currentUser._id),
            ),
          )
          .collect();

        return {
          _id: chat._id,
          name: chat.name,
          image: chat.image,
          createdAt: chat.createdAt,
          isGroupchat: chat.isGroupchat,
          lastMessageText: chat.lastMessageText,
          lastMessageAt: chat.lastMessageAt,
          unreadMessagesCount: unreadMessages.length,
          Users,
        };
      }),
    );
    return chatsWithUsers;
  },
});

export const getChat = query({
  args: {
    chatId: v.id("chats"),
  },
  handler: async (ctx, args) => {
    const chat = await ctx.db.get(args.chatId);
    if (!chat) throw new Error("Chat not found");

    const users = await Promise.all(chat.users.map((id) => ctx.db.get(id)));

    return {
      ...chat,
      users,
    };
  },
});

export const createGroupChat = mutation({
  args: {
    name: v.string(),
    userIds: v.array(v.id("users")),
    image: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!currentUser) throw new Error("User not found");

    return await ctx.db.insert("chats", {
      name: args.name,
      image: args.image,
      users: [...args.userIds, currentUser._id],
      isGroupchat: true,
      createdAt: Date.now(),
    });
  },
});

