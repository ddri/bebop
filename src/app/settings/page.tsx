'use client';

import { useState, useEffect } from 'react';
import { useTheme } from "next-themes";
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function Settings() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Navigation Bar */}
      <nav className="bg-slate-800 text-white p-4">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <span className="text-xl font-bold">Bebop</span>
            <div className="flex space-x-6">
              <Link 
                href="/collections" 
                className={`${pathname === '/collections' ? 'text-yellow-300' : 'hover:text-yellow-300'}`}
              >
                Collections
              </Link>
              <Link 
                href="/" 
                className={`${pathname === '/' ? 'text-yellow-300' : 'hover:text-yellow-300'}`}
              >
                Topics
              </Link>
              <Link 
                href="#" 
                className="hover:text-yellow-300"
              >
                Media
              </Link>
              <Link 
                href="/settings" 
                className={`${pathname === '/settings' ? 'text-yellow-300' : 'hover:text-yellow-300'}`}
              >
                Settings
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto p-8 max-w-7xl">
        <h1 className="text-2xl font-semibold dark:text-white mb-8">Settings</h1>
        
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-500 dark:text-slate-400">
                Settings functionality coming soon...
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}