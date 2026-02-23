import Image from "next/image";
import { RedirectToSignIn, SignedIn, SignedOut, SignIn } from "@clerk/nextjs";

export default function Home() {
  return (
    <div className="flex items-center justify-center h-screen bg-slate-200">
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
      <SignedIn>
        <SignIn forceRedirectUrl="/chats" />
      </SignedIn>
    </div>
  );
}
