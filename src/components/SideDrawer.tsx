"use client";

import React, { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useQuery, useMutation, useConvexAuth } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { Id } from "@/convex/_generated/dataModel";

const SideDrawer = ({ children }: { children: React.ReactNode }) => {
  const [open, setOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const { isAuthenticated } = useConvexAuth();
  const router = useRouter();

  const users = useQuery(
    api.users.getUsers,
    isAuthenticated ? { search: searchText || undefined } : "skip"
  );

  const createOrGetchat = useMutation(
    api.chats.createOrGetChat
  );

  const getChat = async (id: Id<"users">) => {
    try {
      const chatId = await createOrGetchat({
        otherUserId: id
      });
  
      router.push(`/chats/${chatId}`);
      setOpen(false);
    } catch (error) {
      console.error("Error creating or getting chat:", error);
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{children}</SheetTrigger>

      <SheetContent side="left" className="p-4">
        <h1 className="font-semibold text-xl">Search Users</h1>

        <div className="mt-6">
          <Input
            type="text"
            placeholder="Type to search"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-3 mt-6">
          {users?.map((user) => (
            <div
              key={user._id}
              className="flex items-center gap-3 hover:bg-muted rounded-lg p-2 cursor-pointer transition"
              onClick={() => getChat(user._id)}
            >
              <img
                src={user.image}
                alt={user.name}
                className="h-10 w-10 rounded-full object-cover"
              />

              <div>
                <p className="font-medium">{user.name}</p>
                <p className="text-xs text-muted-foreground">
                  {user.email}
                </p>
              </div>
            </div>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default SideDrawer;