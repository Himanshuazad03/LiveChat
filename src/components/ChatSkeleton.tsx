import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

const ChatSkeleton = () => {
  const num: number[] = [1, 2, 3, 4, 5, 6, 7, 8];
  return (
    <div className="pt-5 space-y-7">
      {num.map((item: number) => (
        <div key={item} className="flex items-center gap-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-62.5" />
            <Skeleton className="h-4 w-50" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default ChatSkeleton;
