"use client";
import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, MessageSquarePlus, Search } from "lucide-react";
import { SignedIn, UserButton, useUser } from "@clerk/nextjs";
import SideDrawer from "@/components/SideDrawer";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { useRouter, useParams } from "next/navigation";
import GroupChatDialog from "./GroupChatDialog";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import ChatSkeleton from "@/components/ChatSkeleton";
import { useCurrentUser } from "@/hooks/useCurrentUser";

const SideBar = () => {
  const Allchats = useQuery(api.chats.getAllChats);
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const params = useParams();
  const activeChatId = params.chatId;
  const currentUser = useCurrentUser();

  return (
    <div className="w-full bg-background border-r flex flex-col">
      <div className="p-3 flex items-center justify-between">
        <h1 className="font-semibold text-lg flex items-center gap-2">
          <Users size={20} />
          All Chats
        </h1>

        <div className="flex gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <SideDrawer>
                <Button variant="ghost" size="icon" className="h-10 w-10">
                  <Search className="h-5 w-5" />
                </Button>
              </SideDrawer>
            </TooltipTrigger>
            <TooltipContent>Search Users</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <GroupChatDialog>
                <Button variant="ghost" size="icon" className="h-10 w-10">
                  <MessageSquarePlus className="h-5 w-5" />
                </Button>
              </GroupChatDialog>
            </TooltipTrigger>
            <TooltipContent>New Group Chat</TooltipContent>
          </Tooltip>
        </div>
      </div>

      <Separator />

      <ScrollArea className="flex-1">
        {!isLoaded || !Allchats ? (
          <ChatSkeleton />
        ) : (
          <div className="p-2 space-y-1">
            {Allchats?.length === 0 && (
              <div className="text-center text-muted-foreground mt-10">
                No chats yet. Start a conversation!
              </div>
            )}

            {Allchats?.map((chat) => {
              const otherUser = chat.otherUsers?.find(
                (u) => u?._id !== currentUser?._id,
              );

              const displayName = chat.isGroupchat
                ? chat.name
                : otherUser?.name;

              const displayImage = chat.isGroupchat
                ? chat.image
                : otherUser?.image;

              return (
                <div
                  key={chat._id}
                  className={`flex items-center gap-3 px-3 py-4 rounded-lg transition cursor-pointer
                  ${activeChatId === chat._id ? "bg-muted" : "hover:bg-muted"}`}
                  onClick={() => router.push(`/chats/${chat._id}`)}
                >
                  <Avatar>
                    <AvatarImage src={displayImage} />
                    <AvatarFallback>
                      {displayName?.charAt(0) || "?"}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <p className="font-medium text-[16px] flex gap-2">
                        {displayName}
                        {chat.isGroupchat && chat.otherUsers.length > 0 && (
                          <span className=" bg-slate-600 text-white text-xs font-medium px-2 py-1 rounded-full">
                            {chat.otherUsers.length} members
                          </span>
                        )}
                      </p>

                      <span className="text-xs text-muted-foreground">
                        {chat?.lastMessageAt
                          ? new Date(chat.lastMessageAt).toLocaleTimeString(
                              [],
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              },
                            )
                          : ""}
                      </span>
                    </div>

                    <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
                      {chat?.lastMessageText
                        ? chat.lastMessageText.length > 30
                          ? chat.lastMessageText.slice(0, 30) + "..."
                          : chat.lastMessageText
                        : "Start the conversation"}

                      {chat?.unreadMessagesCount > 0 && (
                        <span className="ml-auto bg-blue-600 text-white text-xs font-medium px-2 py-0.5 rounded-full">
                          {chat.unreadMessagesCount}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </ScrollArea>

      <Separator />

      <div className="p-5 flex items-center justify-between">
        <div className="text-sm text-muted-foreground">My Account</div>
        <div className="flex gap-2 items-center">
          <SignedIn>
            <UserButton afterSignOutUrl="/sign-in" />
            <p>{user?.firstName}</p>
          </SignedIn>
        </div>
      </div>
    </div>
  );
};

export default SideBar;
