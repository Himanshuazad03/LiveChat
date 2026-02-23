import React from "react";
import { SignedIn, UserButton } from "@clerk/nextjs";
import SideBar from "@/components/SideBar";

const page = () => {
  return (
    <div className="bg-slate-200 min-h-screen">
        <SideBar/>
    </div>
  );
};

export default page;
