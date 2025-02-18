import { SignInButtons, UserNav } from "./AuthComponents";
import { useAuth } from "@clerk/nextjs";

export const Header = () => {
  const { isSignedIn, isLoaded } = useAuth();

  return (
    <header className="border-b border-slate-700 bg-[#1c1c1e]">
      <div className="flex h-16 items-center px-4 container mx-auto justify-between">
        <div className="font-bold text-xl text-white">Bebop</div>
        {isLoaded && (
          <div className="ml-auto">
            {isSignedIn ? <UserNav /> : <SignInButtons />}
          </div>
        )}
      </div>
    </header>
  );
};