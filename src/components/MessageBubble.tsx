import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Id } from "@/convex/_generated/dataModel";
import { Check } from "lucide-react";

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
}: {
  isOwn: boolean;
  message: MessageWithSender;
  isGroupChat: boolean;
}) => {
  return (
    <div
      className={`flex items-end gap-2 ${isOwn ? "justify-end" : "justify-start"}`}
    >
      {!isOwn && isGroupChat && (
        <Avatar className="h-8 w-8">
          <AvatarImage src={message?.sender?.image} />
          <AvatarFallback>{message?.sender?.name?.slice(0, 1)}</AvatarFallback>
        </Avatar>
      )}

      <div className="flex flex-col max-w-xs">
        <div
          className={`${
            isOwn
              ? "bg-primary text-primary-foreground"
              : "bg-slate-100 text-slate-900"
          } shadow-sm border rounded-2xl px-4 py-2 text-sm ${
            isOwn ? "rounded-br-none" : "rounded-bl-none"
          }`}
        >
          {message.text}
        </div>

        <div className="flex items-center justify-between mt-1">
          <span className="text-[10px] text-muted-foreground">
            {new Date(message.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>

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
