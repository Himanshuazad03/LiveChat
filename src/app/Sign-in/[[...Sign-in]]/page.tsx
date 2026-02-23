import { SignIn } from "@clerk/nextjs";
import React from "react";

function Page() {
  return (
    <div className="flex items-center justify-center h-screen bg-slate-200">
      <SignIn/>
    </div>
  );
}

export default Page;
