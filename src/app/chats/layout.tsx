"use client";

import { useParams, useRouter } from "next/navigation";
import SideBar from "@/components/SideBar";

export default function ChatsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const chatId = params?.chatId;

  return (
    <div className="flex h-screen overflow-hidden">
      <div
        className={`
          ${chatId ? "hidden md:flex" : "flex"}
          w-full md:w-sm border-r bg-background
        `}
      >
        <SideBar />
      </div>

      <div
        className={`
          ${chatId ? "flex" : "hidden md:flex"}
          flex-1
        `}
      >
        {children}
      </div>
    </div>
  );
}
