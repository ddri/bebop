'use client';

import { SignInButton, SignOutButton, UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Github } from "lucide-react";

export const SignInButtons = () => {
  return (
    <div className="flex items-center gap-4">
      <SignInButton mode="modal">
        <Button 
          variant="outline"
          className="border-slate-700 text-white hover:bg-[#2f2f2d]"
        >
          <Github className="w-4 h-4 mr-2" />
          Sign in with GitHub
        </Button>
      </SignInButton>
    </div>
  );
};

export const UserNav = () => {
  return (
    <div className="flex items-center gap-4">
      <SignOutButton>
        <Button 
          variant="ghost" 
          className="text-slate-400 hover:text-white"
        >
          Sign out
        </Button>
      </SignOutButton>
      <UserButton 
        appearance={{
          elements: {
            userButtonBox: "hover:opacity-80 transition-opacity",
            userButtonTrigger: "focus:shadow-none",
            userButtonAvatarBox: "w-8 h-8"
          }
        }}
      />
    </div>
  );
};