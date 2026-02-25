"use client";

import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Id } from "@/convex/_generated/dataModel";
import { Check, MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

type MessageWithSender = {
  sender: {
    _id: Id<"users">;
    image?: string;
    name: string;
  } | null;
  _id: Id<"messages">;
  createdAt: number;
  text: string;
  senderId: Id<"users">;
  chatId: Id<"chats">;
  isRead: boolean;
};

const MessageBubble = ({
  isOwn,
  message,
  isGroupChat,
  time,
}: {
  isOwn: boolean;
  message: MessageWithSender;
  isGroupChat: boolean;
  time: string;
}) => {

  const deleteMessage = useMutation(api.message.deleteMessage);
  const handleDelete = () => {
    deleteMessage({ messageId: message._id });
  };

  return (
    <div
      className={`flex items-end gap-2 ${
        isOwn ? "justify-end" : "justify-start"
      } animate-message`}
    >
      {!isOwn && isGroupChat && (
        <Avatar className="h-8 w-8">
          <AvatarImage src={message?.sender?.image} />
          <AvatarFallback>{message?.sender?.name?.slice(0, 1)}</AvatarFallback>
        </Avatar>
      )}

      <div className="flex flex-col max-w-xs">
        <div
          className={`relative ${
            isOwn
              ? "bg-primary text-primary-foreground"
              : "bg-slate-100 text-slate-900"
          } shadow-sm border rounded-2xl px-4 py-3 text-sm ${
            isOwn ? "rounded-br-none" : "rounded-bl-none"
          } group`}
        >
          {isOwn && (
            <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="p-1 rounded-full hover:bg-muted/50 focus:outline-none focus:ring-0 focus:ring-offset-0 ">
                    <MoreVertical className="h-4 w-4 opacity-60 hover:opacity-100" />
                  </button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={handleDelete}
                    className="text-red-500 focus:text-red-500"
                  >
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}

          <div className="pr-6">{message.text}</div>
        </div>

        <div className="flex items-center justify-between mt-1">
          <span className="text-[10px] text-muted-foreground">{time}</span>

          {isOwn && (
            <div
              className={`flex -space-x-1 ml-2 ${
                message.isRead ? "text-blue-400" : "text-muted-foreground"
              }`}
            >
              <Check className="h-3 w-3" />
              {message.isRead && <Check className="h-3 w-3" />}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
