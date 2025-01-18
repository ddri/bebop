'use client';

import { useState, useEffect } from 'react';
import { useTheme } from "next-themes";
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';

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
          {/* Import Section */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Import Content</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Import Markdown Files
                  </label>
                  <input
                    type="file"
                    accept=".md"
                    multiple
                    className="hidden"
                    id="markdown-import"
                    onChange={async (e) => {
                      if (!e.target.files?.length) return;

                      // Get existing topics from localStorage
                      const existingTopics = JSON.parse(localStorage.getItem('markdown-docs') || '[]');
                      const newTopics = [];

                      // Process each file
                      for (const file of Array.from(e.target.files)) {
                        const content = await file.text();
                        const name = file.name.replace('.md', '');
                        
                        newTopics.push({
                          id: Date.now() + Math.random(), // Ensure unique ID
                          name: name,
                          content: content
                        });
                      }

                      // Combine existing and new topics
                      const updatedTopics = [...existingTopics, ...newTopics];
                      localStorage.setItem('markdown-docs', JSON.stringify(updatedTopics));

                      // Reset input
                      e.target.value = '';

                      // Show success message
                      alert(`Successfully imported ${newTopics.length} files`);
                    }}
                  />
                  <Button
                    onClick={() => document.getElementById('markdown-import')?.click()}
                    className="w-full border-2 border-dashed p-8 hover:border-yellow-400 transition-colors"
                  >
                    <Upload className="h-6 w-6 mr-2" />
                    Click to select Markdown files
                  </Button>
                </div>

                <div className="text-sm text-slate-500">
                  Supported file type: .md (Markdown)
                  <br />
                  Imported files will appear in your Topics list
                </div>
              </div>
            </CardContent>
          </Card>

          {/* General Settings Card */}
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