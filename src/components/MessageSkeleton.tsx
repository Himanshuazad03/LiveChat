"use client";

import React from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const SkeletonBubble = ({ isOwn }: { isOwn: boolean }) => {
  return (
    <div
      className={`flex items-end gap-2 ${
        isOwn ? "justify-end" : "justify-start"
      }`}
    >
      <div className="flex flex-col max-w-xs">
        <div
          className={`shadow-sm border rounded-2xl px-4 py-3 space-y-2 ${
            isOwn
              ? "bg-primary/40 rounded-br-none"
              : "bg-slate-200 rounded-bl-none"
          }`}
        >
          <div className="h-3 w-32 bg-white/50 rounded animate-pulse" />
          <div className="h-3 w-20 bg-white/50 rounded animate-pulse" />
        </div>

        <div className="flex items-center mt-1">
          <div className="h-2 w-10 bg-muted rounded animate-pulse" />
        </div>
      </div>
    </div>
  );
};

const MessageSkeleton = () => {
  const skeletonCount = 8;

  return (
    <div className="space-y-4 p-2">
      {Array.from({ length: skeletonCount }).map((_, index) => (
        <SkeletonBubble key={index} isOwn={index % 2 === 0} />
      ))}
    </div>
  );
};

export default MessageSkeleton;
