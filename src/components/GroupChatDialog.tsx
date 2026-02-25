"use client";

import { useState, useMemo } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { X } from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import {toast} from "sonner";

type Props = {
  children: React.ReactNode;
};

export default function CreateGroupDialog({ children }: Props) {
  const [open, setOpen] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [search, setSearch] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<Id<"users">[]>([]);
  const [groupImage, setGroupImage] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);

  const users = useQuery(api.users.getUsers, { search });
  const createGroupChat = useMutation(api.chats.createGroupChat);

  const filteredUsers = useMemo(() => {
    return users?.filter((user) =>
      user.name.toLowerCase().includes(search.toLowerCase()),
    );
  }, [users, search]);

  const router = useRouter();

  const toggleUser = (userId: Id<"users">) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId],
    );
  };

  const removeUser = (userId: Id<"users">) => {
    setSelectedUsers((prev) => prev.filter((id) => id !== userId));
  };

  const handleCreate = async () => {
    try {
      if (!groupName.trim() || selectedUsers.length === 0) return;
      if(selectedUsers.length < 3) {
        toast.error("Please select more than 2 users ");
        return;
      }
  
      setLoading(true);
  
      const groupId = await createGroupChat({
        name: groupName,
        userIds: selectedUsers,
        image: groupImage,
      });
  
      setLoading(false);
      setGroupName("");
      setSelectedUsers([]);
      setSearch("");
      setOpen(false);
      setGroupImage(undefined);
  
      toast.success("Group chat created successfully");
  
      router.push(`/chats/${groupId}`);
    } catch (error) {
      toast.error("Failed to create group chat");
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create Group Chat</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center gap-3">
          <label className="relative cursor-pointer">
            <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center overflow-hidden">
              {groupImage ? (
                <img src={groupImage} className="h-full w-full object-cover" />
              ) : (
                <span className="text-sm text-muted-foreground">Upload</span>
              )}
            </div>

            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;

                const reader = new FileReader();
                reader.onloadend = () => {
                  setGroupImage(reader.result as string);
                };
                reader.readAsDataURL(file);
              }}
            />
          </label>
        </div>

        <Input
          placeholder="Enter group name"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
        />

        {selectedUsers.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {selectedUsers.map((id) => {
              const user = users?.find((u) => u._id === id);
              return (
                <Button
                  key={id}
                  variant="default"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    removeUser(id);
                  }}
                  className="ml-1 flex gap-1 items-center text-sm rounded-full"
                >
                  {user?.name}
                  <X className="h-3 w-3" />
                </Button>
              );
            })}
          </div>
        )}

        <Input
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mt-4"
        />

        <ScrollArea className="h-60 mt-3 pr-4">
          <div className="space-y-2">
            {filteredUsers?.map((user) => {
              const isSelected = selectedUsers.includes(user._id);

              return (
                <div
                  key={user._id}
                  onClick={() => toggleUser(user._id)}
                  className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition ${
                    isSelected
                      ? "bg-blue-50 border border-blue-200"
                      : "hover:bg-muted"
                  }`}
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.image} />
                    <AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
                  </Avatar>

                  <span className="flex-1 text-sm">{user.name}</span>

                  {isSelected && (
                    <span className="text-blue-500 text-xs">Selected</span>
                  )}
                </div>
              );
            })}
          </div>
        </ScrollArea>

        <DialogFooter className="mt-4">
          <Button
            onClick={handleCreate}
            disabled={
              loading || !groupName.trim() || selectedUsers.length === 0
            }
            className="min-w-30"
          >
            {loading ? (
              <div className="flex items-center">
                <Loader2 className="animate-spin h-4 w-4" />
                <span className="ml-2">Creating...</span>
              </div>
            ) : (
              "Create"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
