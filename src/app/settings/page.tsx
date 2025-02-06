'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useCollections } from '@/hooks/useCollections';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Upload, Eye, Globe, ExternalLink } from 'lucide-react';
import Layout from '@/components/Layout';
import { TemplateManager } from '@/components/templates/TemplateManager';
import { SocialSettings } from '@/components/settings/SocialSettings';

export default function Settings() {
  const pathname = usePathname();
  const { collections, unpublishCollection } = useCollections();

  return (
    <Layout pathname={pathname}>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-semibold mb-8 dark:text-white">Settings</h1>
        
        <div className="space-y-6">
          {/* Template Manager */}
          <TemplateManager />

          {/* Import Content Section */}
          <Card>
            <CardHeader>
              <CardTitle>Import Content</CardTitle>
              <CardDescription>
                Import existing markdown files into Bebop
              </CardDescription>
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

        {/* Social Settings */}
        <SocialSettings />

          {/* Published Collections Section */}
          <Card>
            <CardHeader>
              <CardTitle>Published Collections</CardTitle>
              <CardDescription>
                Manage your published content across platforms
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {collections?.filter(c => c.publishedUrl || c.hashnodeUrl || c.devToUrl).map(collection => (
                  <div 
                    key={collection.id}
                    className="flex items-center justify-between p-4 border rounded-lg dark:border-slate-700 bg-white dark:bg-slate-800"
                  >
                    <div>
                      <h3 className="font-medium">{collection.name}</h3>
                      <div className="text-sm space-y-1">
                        {collection.publishedUrl && (
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
                        )}
                        {collection.hashnodeUrl && (
                          <p className="text-slate-500">
                            Hashnode: <a 
                              href={collection.hashnodeUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-500 hover:text-blue-600 inline-flex items-center gap-1"
                            >
                              View <ExternalLink className="h-3 w-3" />
                            </a>
                          </p>
                        )}
                        {collection.devToUrl && (
                          <p className="text-slate-500">
                            Dev.to: <a 
                              href={collection.devToUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-500 hover:text-blue-600 inline-flex items-center gap-1"
                            >
                              View <ExternalLink className="h-3 w-3" />
                            </a>
                          </p>
                        )}
                        <p className="text-slate-500">
                          Last updated: {new Date(collection.lastEdited).toLocaleDateString()}
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
                          if (await unpublishCollection(collection.id)) {
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
                {collections && !collections.some(c => c.publishedUrl) && (
                  <div className="text-center text-slate-500 py-8">
                    No published collections yet
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Hashnode Integration */}
          <Card>
            <CardHeader>
              <CardTitle>Hashnode Integration</CardTitle>
              <CardDescription>
                Configure your Hashnode publication settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium mb-2">
                  Personal Access Token
                </label>
                <Input
                  type="password"
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
                  placeholder="Enter your Hashnode publication ID"
                />
                <p className="text-sm text-slate-500">
                  Found in your Hashnode publication settings
                </p>
              </div>

              <Button className="bg-yellow-400 hover:bg-yellow-500 text-black">
                Save Hashnode Settings
              </Button>
            </CardContent>
          </Card>

          {/* Dev.to Integration */}
          <Card>
            <CardHeader>
              <CardTitle>Dev.to Integration</CardTitle>
              <CardDescription>
                Configure your Dev.to API settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium mb-2">
                  API Key
                </label>
                <Input
                  type="password"
                  placeholder="Enter your Dev.to API key"
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

              <Button className="bg-yellow-400 hover:bg-yellow-500 text-black">
                Save Dev.to Settings
              </Button>
            </CardContent>
          </Card>

          {/* General Settings */}
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>
                Configure general application settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-slate-500 dark:text-slate-400">
                Additional settings are in development.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}