"use client";

import SideBar from "@/components/SideBar";
import { useUser } from "@clerk/nextjs";

export default function ChatPage() {
  const { isLoaded } = useUser();
  {
    !isLoaded && (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    );
  }
  return (
    <div className="flex-1 flex items-center justify-center text-muted-foreground">
      Select a chat to start messaging
    </div>
  );
}
