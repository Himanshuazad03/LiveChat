import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Id } from "@/convex/_generated/dataModel";

interface GroupInfoDialogProps {
  group?: {
    users: ({
      _id: Id<"users">;
      _creationTime: number;
      image?: string;
      name: string;
      email: string;
      clerkId: string;
      isOnline: boolean;
      createdAt: number;
    } | null)[];
    _id: Id<"chats">;
    _creationTime: number;
    image?: string;
    lastMessageAt?: number;
    lastMessageText?: string;
    name: string;
    createdAt: number;
    isGroupchat: boolean;
  };
  children: React.ReactNode;
}

function GroupInfoDialog({ group, children }: GroupInfoDialogProps) {
  if (!group) return null;
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Group Info</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center space-y-3">
          <Avatar className="h-20 w-20">
            <AvatarImage src={group?.image} alt={group?.name} />
            <AvatarFallback>
              {group?.name?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <h2 className="text-lg font-semibold">{group?.name}</h2>
          <p className="text-sm text-muted-foreground">
            {group?.users?.length} members
          </p>
        </div>

        <div className="mt-4">
          <h3 className="text-sm font-medium mb-2">Members</h3>

          <ScrollArea className="h-60 pr-4 overflow-y-auto">
            <div className="space-y-5">
              {group?.users?.map((user) => (
                <div key={user?._id} className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.image} alt={user?.name} />
                    <AvatarFallback>
                      {user?.name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  <span className="text-sm">{user?.name}</span>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default GroupInfoDialog;
