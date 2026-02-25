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

const MessageBox = ({ chatId }: { chatId: Id<"chats"> }) => {
  const [message, setMessage] = useState("");

  const currentUser = useCurrentUser();
  const currentUserId = currentUser?._id;

  const router = useRouter();

  const markAsRead = useMutation(api.message.markMessagesAsRead);
  const sendMessage = useMutation(api.message.sendMessage);

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    await sendMessage({
      chatId,
      text: message,
    });

    setMessage("");
  };
  const getChat = useQuery(api.chats.getChat, { chatId: chatId });

  const otherUser = getChat?.users?.find((user) => user?._id !== currentUserId);
  const messages = useQuery(api.message.getMessages, { chatId: chatId });

  const scrollRef = useRef<HTMLDivElement>(null);

  const messageCount = messages?.length;

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
            <AvatarImage src={otherUser?.image} />
            <AvatarFallback>{otherUser?.name.slice(0, 1)}</AvatarFallback>
          </Avatar>

          <div className="leading-tight">
            <p className="font-semibold">{otherUser?.name}</p>
          </div>
        </div>

        <Button variant="ghost" size="icon">
          <MoreVertical className="h-5 w-5" />
        </Button>
      </div>

      <ScrollArea className="flex-1 px-6 overflow-y-auto">
        <div className="space-y-6 m-2">
          {messages?.map((message) => (
            <MessageBubble
              key={message._id}
              isOwn={message.senderId === currentUserId}
              message={message}
              isGroupChat={getChat?.isGroupchat}
            />
          ))}
        </div>
        <div ref={scrollRef} />
      </ScrollArea>

      <div className="border-t bg-background p-2">
        <div className="flex items-center gap-3 bg-muted/60 rounded-xl px-4 py-2">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
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
