'use client';

// src/components/Layout.tsx
import Link from 'next/link';
import { useAuth } from "@clerk/nextjs";
import { SignInButtons, UserNav } from "./AuthComponents";
import { ErrorBoundary } from "./ErrorBoundary";
import { SearchBar } from "./SearchBar";

interface LayoutProps {
  children: React.ReactNode;
  pathname?: string;
}

export default function Layout({ children, pathname }: LayoutProps) {
  const { isSignedIn, isLoaded } = useAuth();

  return (
    <div className="min-h-screen bg-[#2f2f2d]">
      {/* Navigation Bar */}
      <nav className="bg-[#DBDBCC] text-slate-800 p-4">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link 
              href="/" 
              className="text-xl font-bold hover:text-[#E669E8] transition-colors"
            >
              Bebop
            </Link>
            <div className="flex space-x-6">
              <Link 
                href="/write" 
                className={`${pathname === '/write' ? 'text-[#E669E8] font-semibold' : 'hover:text-[#E669E8]'} transition-colors`}
              >
                Write
              </Link>
              <Link 
                href="/topics" 
                className={`${pathname === '/topics' ? 'text-[#E669E8] font-semibold' : 'hover:text-[#E669E8]'} transition-colors`}
              >
                Topics
              </Link>
              <Link 
                href="/collections" 
                className={`${pathname === '/collections' ? 'text-[#E669E8] font-semibold' : 'hover:text-[#E669E8]'} transition-colors`}
              >
                Collections
              </Link>
              <Link 
                href="/campaigns" 
                className={`${pathname === '/campaigns' ? 'text-[#E669E8] font-semibold' : 'hover:text-[#E669E8]'} transition-colors`}
              >
                Campaigns
              </Link>
              <Link 
                href="/media" 
                className={`${pathname === '/media' ? 'text-[#E669E8] font-semibold' : 'hover:text-[#E669E8]'} transition-colors`}
              >
                Media
              </Link>
              <Link 
                href="/search" 
                className={`${pathname === '/search' ? 'text-[#E669E8] font-semibold' : 'hover:text-[#E669E8]'} transition-colors`}
              >
                Search
              </Link>
              <Link 
                href="/settings" 
                className={`${pathname === '/settings' ? 'text-[#E669E8] font-semibold' : 'hover:text-[#E669E8]'} transition-colors`}
              >
                Settings
              </Link>
            </div>
          </div>
          
          {/* Search Bar */}
          {isSignedIn && (
            <div className="flex-1 max-w-md mx-8">
              <SearchBar 
                placeholder="Search..."
                showQuickResults={true}
                maxQuickResults={5}
              />
            </div>
          )}
          
          {isLoaded && (
            <div>
              {isSignedIn ? <UserNav /> : <SignInButtons />}
            </div>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto p-8 max-w-7xl">
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </div>
    </div>
  );
}