"use client";

import {MessageSquareMoreIcon} from "lucide-react"

export default function ChatPage() {
 
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
      <MessageSquareMoreIcon className="h-50 w-50" />
      <p className="text-sm mt-2">Select a chat to start messaging</p>
    </div>
  );
}
