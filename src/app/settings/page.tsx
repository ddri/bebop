'use client';

import { useState, useEffect } from 'react';
import { useTheme } from "next-themes";
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, Eye, Globe, ExternalLink } from 'lucide-react';
import { useHashnodeSettings } from '@/hooks/useHashnodeSettings';
import { useDevToSettings } from '@/hooks/useDevToSettings';

interface Collection {
  id: number;
  name: string;
  description?: string;
  topicIds: number[];
  lastEdited: number;
  publishedUrl?: string;
}

export default function Settings() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const { theme } = useTheme();
  const [collections, setCollections] = useState<Collection[]>([]);
  
  // Hashnode state
  const [hashnodeToken, setHashnodeToken] = useState('');
  const [publicationId, setPublicationId] = useState('');
  
  // Dev.to state
  const [devToToken, setDevToToken] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  // Load collections and settings on mount
  useEffect(() => {
    if (mounted && typeof window !== 'undefined') {
      const savedCollections = localStorage.getItem('collections');
      const savedHashnodeToken = localStorage.getItem('hashnodeToken');
      const savedPubId = localStorage.getItem('hashnodePublicationId');
      const savedDevToToken = localStorage.getItem('devToToken');
      
      if (savedCollections) {
        setCollections(JSON.parse(savedCollections));
      }
      if (savedHashnodeToken) setHashnodeToken(savedHashnodeToken);
      if (savedPubId) setPublicationId(savedPubId);
      if (savedDevToToken) setDevToToken(savedDevToToken);
    }
  }, [mounted]);

  const saveHashnodeSettings = () => {
    localStorage.setItem('hashnodeToken', hashnodeToken);
    localStorage.setItem('hashnodePublicationId', publicationId);
    alert('Hashnode settings saved successfully');
  };

  const saveDevToSettings = () => {
    localStorage.setItem('devToToken', devToToken);
    alert('Dev.to settings saved successfully');
  };

  // Function to unpublish a collection
  const unpublishCollection = async (collection: Collection) => {
    try {
      const response = await fetch('/api/unpublish', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileName: collection.publishedUrl?.split('/').pop()
        }),
      });

      if (!response.ok) throw new Error('Failed to unpublish');

      // Update collection to remove publishedUrl
      const updatedCollections = collections.map(c => 
        c.id === collection.id 
          ? { ...c, publishedUrl: undefined } 
          : c
      );
      setCollections(updatedCollections);
      localStorage.setItem('collections', JSON.stringify(updatedCollections));

      return true;
    } catch (error) {
      console.error('Error unpublishing:', error);
      alert('Failed to unpublish collection');
      return false;
    }
  };

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
          {/* Hashnode Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Hashnode Integration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium mb-2">
                  Personal Access Token
                </label>
                <Input
                  type="password"
                  value={hashnodeToken}
                  onChange={(e) => setHashnodeToken(e.target.value)}
                  placeholder="Enter your Hashnode Personal Access Token"
                />
                <p className="text-sm text-slate-500">
                  Get your token from{' '}
                  <a 
                    href="https://hashnode.com/settings/developer"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline"
                  >
                    Hashnode Developer Settings
                  </a>
                </p>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium mb-2">
                  Publication ID
                </label>
                <Input
                  type="text"
                  value={publicationId}
                  onChange={(e) => setPublicationId(e.target.value)}
                  placeholder="Enter your Hashnode publication ID"
                />
                <p className="text-sm text-slate-500">
                  Found in your Hashnode publication settings
                </p>
              </div>

              <Button
                onClick={saveHashnodeSettings}
                className="bg-yellow-400 hover:bg-yellow-500 text-black"
              >
                Save Hashnode Settings
              </Button>
            </CardContent>
          </Card>

          {/* Dev.to Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Dev.to Integration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium mb-2">
                  API Key
                </label>
                <Input
                  type="password"
                  value={devToToken}
                  onChange={(e) => setDevToToken(e.target.value)}
                  placeholder="Enter your Dev.to API Key"
                />
                <p className="text-sm text-slate-500">
                  Get your API key from{' '}
                  <a 
                    href="https://dev.to/settings/extensions"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline"
                  >
                    Dev.to Settings
                  </a>
                </p>
              </div>

              <Button
                onClick={saveDevToSettings}
                className="bg-yellow-400 hover:bg-yellow-500 text-black"
              >
                Save Dev.to Settings
              </Button>
            </CardContent>
          </Card>

          {/* Published Collections Section */}
          <Card>
            <CardHeader>
              <CardTitle>Published Collections</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {collections.filter(c => c.publishedUrl).map(collection => (
                  <div 
                    key={collection.id}
                    className="flex items-center justify-between p-4 border rounded-lg dark:border-slate-700 bg-white dark:bg-slate-800"
                  >
                    <div>
                      <h3 className="font-medium">{collection.name}</h3>
                      <div className="text-sm space-y-1">
                        <p className="text-slate-500">
                          Published URL: <a 
                            href={collection.publishedUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:text-blue-600 inline-flex items-center gap-1"
                          >
                            View <ExternalLink className="h-3 w-3" />
                          </a>
                        </p>
                        <p className="text-slate-500">
                          Last updated: {new Date(collection.lastEdited).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(collection.publishedUrl, '_blank')}
                        className="text-slate-600 hover:text-blue-600"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={async () => {
                          if (await unpublishCollection(collection)) {
                            alert('Collection unpublished successfully');
                          }
                        }}
                        className="text-slate-600 hover:text-red-600"
                      >
                        <Globe className="h-4 w-4 mr-2" />
                        Unpublish
                      </Button>
                    </div>
                  </div>
                ))}
                {!collections.some(c => c.publishedUrl) && (
                  <div className="text-center text-slate-500 py-8">
                    No published collections yet
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Import Section */}
          <Card>
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

                      const existingTopics = JSON.parse(localStorage.getItem('markdown-docs') || '[]');
                      const newTopics = [];

                      for (const file of Array.from(e.target.files)) {
                        const content = await file.text();
                        const name = file.name.replace('.md', '');
                        
                        newTopics.push({
                          id: Date.now() + Math.random(),
                          name: name,
                          content: content
                        });
                      }

                      const updatedTopics = [...existingTopics, ...newTopics];
                      localStorage.setItem('markdown-docs', JSON.stringify(updatedTopics));

                      e.target.value = '';
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

          {/* General Settings */}
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-500 dark:text-slate-400">
                Additional settings are in development.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}