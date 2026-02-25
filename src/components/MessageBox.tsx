"use client";

import React, { useEffect, useState, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MoreVertical } from "lucide-react";
import { Send } from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import MessageBubble from "./MessageBubble";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useLayoutEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { formatTime } from "@/lib/utils";
import DateDivider from "@/components/Divider";
import { getDateLabel } from "@/lib/utils";
import { useUser } from "@clerk/nextjs";
import { Skeleton } from "@/components/ui/skeleton";
import MessageSkeleton from "@/components/MessageSkeleton";

const MessageBox = ({ chatId }: { chatId: Id<"chats"> }) => {
  const [message, setMessage] = useState("");

  const { isLoaded } = useUser();

  const currentUser = useCurrentUser();
  const currentUserId = currentUser?._id;

  const router = useRouter();

  const markAsRead = useMutation(api.message.markMessagesAsRead);
  const sendMessage = useMutation(api.message.sendMessage);

  const setTyping = useMutation(api.message.setTyping);
  const typingUsers = useQuery(api.message.getTyping, { chatId });

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    setTyping({ chatId, isTyping: false });

    await sendMessage({
      chatId,
      text: message,
    });

    setMessage("");
  };

  const typingTimeout = useRef<NodeJS.Timeout | null>(null);

  const handleTyping = () => {
    setTyping({ chatId, isTyping: true });

    if (typingTimeout.current) {
      clearTimeout(typingTimeout.current);
    }

    typingTimeout.current = setTimeout(() => {
      setTyping({ chatId, isTyping: false });
    }, 3000);
  };
  const getChat = useQuery(api.chats.getChat, { chatId: chatId });

  const otherUser = getChat?.users?.find((user) => user?._id !== currentUserId);
  const messages = useQuery(api.message.getMessages, { chatId: chatId });

  const scrollRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!messages?.length) return;

    scrollRef.current?.scrollIntoView({
      behavior: "auto",
    });
  }, [messages?.length]);

  useEffect(() => {
    if (!messages?.length) return;
    markAsRead({ chatId });
  }, [messages]);

  return (
    <div className="flex-1 flex h-full flex-col bg-muted/30">
      <div className=" h-16 border-b bg-background px-6 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => router.push("/chats")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <Avatar className="h-10 w-10">
            <AvatarImage
              src={getChat?.isGroupchat ? getChat?.image : otherUser?.image}
            />
            <AvatarFallback>
              {getChat?.isGroupchat
                ? getChat?.name.slice(0, 1)
                : otherUser?.name.slice(0, 1)}
            </AvatarFallback>
          </Avatar>
          {!isLoaded || !getChat ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-62.5" />
              <Skeleton className="h-4 w-50" />
            </div>
          ) : (
            <div className="leading-tight">
              <p className="font-semibold">
                {getChat?.isGroupchat ? getChat?.name : otherUser?.name}
              </p>
            </div>
          )}
        </div>
      </div>

      <ScrollArea className="flex-1 px-6 overflow-y-auto">
        {!isLoaded || !messages ? (
          <MessageSkeleton />
        ) : messages?.length === 0 ? (
          <div className="min-h-full flex items-center justify-center mt-20">
            <div className="flex flex-col items-center text-center px-6">
              <div className="relative flex items-center justify-center">
                <div className="absolute w-32 h-32 rounded-full bg-blue-500/5 blur-2xl" />

                <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-blue-500/10">
                  <Send className="h-8 w-8 text-blue-500" />
                </div>
              </div>

              <h2 className="mt-6 text-lg font-medium">No messages here yet</h2>

              <p className="mt-2 text-sm text-muted-foreground max-w-xs">
                Send a message to start the conversation.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6 m-2">
            {messages?.map((message, index) => {
              const showDivider =
                index === 0 ||
                new Date(messages[index - 1].createdAt).toDateString() !==
                  new Date(message.createdAt).toDateString();

              return (
                <React.Fragment key={message._id}>
                  {showDivider && (
                    <DateDivider label={getDateLabel(message.createdAt)} />
                  )}

                  <MessageBubble
                    isOwn={message.senderId === currentUser?._id}
                    message={message}
                    isGroupChat={getChat?.isGroupchat}
                    time={formatTime(message.createdAt)}
                  />
                </React.Fragment>
              );
            })}
            <div ref={scrollRef} />
          </div>
        )}
      </ScrollArea>
      <div>
        {typingUsers &&
          typingUsers?.some((t) => t.userId !== currentUserId) && (
            <div className="flex items-center gap-1.5 px-6 py-1">
              <span className="text-sm text-muted-foreground">Typing</span>
              <div className="flex gap-1">
                <span className="h-1.5 w-1.5 bg-muted-foreground rounded-full animate-bounce" />
                <span className="h-1.5 w-1.5 bg-muted-foreground rounded-full animate-bounce delay-150" />
                <span className="h-1.5 w-1.5 bg-muted-foreground rounded-full animate-bounce delay-300" />
              </div>
            </div>
          )}
      </div>

      <div className="border-t bg-background p-2">
        <div className="flex items-center gap-3 bg-muted/60 rounded-xl px-4 py-2">
          <Input
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              handleTyping();
            }}
            placeholder="Type a message..."
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            className="border-none bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
          />
          <Button
            size="sm"
            className="rounded-full h-9 w-9"
            onClick={() => {
              handleSendMessage();
              setMessage("");
            }}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MessageBox;
