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
import { SocialSettings, GitHubSettings } from '../../components/settings';

export default function Settings() {
  const pathname = usePathname();
  const { collections, unpublishCollection } = useCollections();

  return (
    <Layout pathname={pathname}>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-semibold mb-8 text-white">Settings</h1>
        
        <div className="space-y-6">
          {/* Template Manager */}
          <TemplateManager />

          {/* GitHub Integration */}
          <Card className="bg-[#1c1c1e] border-0">
            <CardHeader>
              <CardTitle className="text-white text-2xl">GitHub Integration</CardTitle>
              <CardDescription className="text-slate-300">
                Connect with GitHub for backups and content management
              </CardDescription>
            </CardHeader>
            <CardContent>
              <GitHubSettings />
            </CardContent>
          </Card>

          {/* Import Content Section */}
          <Card className="bg-[#1c1c1e] border-0">
            <CardHeader>
              <CardTitle className="text-white text-2xl">Import Content</CardTitle>
              <CardDescription className="text-slate-300">
                Import existing markdown files into Bebop
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-white">
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
                  <div className="p-4 rounded-lg bg-[#2f2f2d] border border-slate-700">
                    <Button
                      onClick={() => document.getElementById('markdown-import')?.click()}
                      className="w-full flex items-center justify-center bg-transparent border-2 border-dashed border-slate-600 p-8 hover:border-[#E669E8] hover:text-[#E669E8] transition-colors text-white"
                    >
                      <Upload className="h-6 w-6 mr-2" />
                      Click to select Markdown files
                    </Button>
                  </div>

                  <div className="mt-4 space-y-1">
                    <p className="text-sm text-slate-300">
                      Supported file type: .md (Markdown)
                    </p>
                    <p className="text-sm text-slate-300">
                      Imported files will appear in your Topics list
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Social Settings */}
          <SocialSettings />

          {/* Published Collections Section */}
          <Card className="bg-[#1c1c1e] border-0">
            <CardHeader>
              <CardTitle className="text-white">Published Collections</CardTitle>
              <CardDescription className="text-slate-300">
                Manage your published content across platforms
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {collections?.filter(c => c.publishedUrl || c.hashnodeUrl || c.devToUrl).map(collection => (
                  <div 
                    key={collection.id}
                    className="flex items-center justify-between p-4 border rounded-lg border-slate-700 bg-[#2f2f2d]"
                  >
                    <div>
                      <h3 className="font-medium text-white">{collection.name}</h3>
                      <div className="text-sm space-y-1">
                        {collection.publishedUrl && (
                          <p className="text-slate-300">
                            Published URL: <a 
                              href={collection.publishedUrl} 
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[#E669E8] hover:text-[#d15dd3] inline-flex items-center gap-1"
                            >
                              View <ExternalLink className="h-3 w-3" />
                            </a>
                          </p>
                        )}
                        {collection.hashnodeUrl && (
                          <p className="text-slate-300">
                            Hashnode: <a 
                              href={collection.hashnodeUrl} 
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[#E669E8] hover:text-[#d15dd3] inline-flex items-center gap-1"
                            >
                              View <ExternalLink className="h-3 w-3" />
                            </a>
                          </p>
                        )}
                        {collection.devToUrl && (
                          <p className="text-slate-300">
                            Dev.to: <a 
                              href={collection.devToUrl} 
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[#E669E8] hover:text-[#d15dd3] inline-flex items-center gap-1"
                            >
                              View <ExternalLink className="h-3 w-3" />
                            </a>
                          </p>
                        )}
                        <p className="text-slate-300">
                          Last updated: {new Date(collection.lastEdited).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(collection.publishedUrl, '_blank')}
                        className="text-white border-slate-600 hover:bg-[#E669E8] hover:text-white"
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
                        className="text-white border-slate-600 hover:bg-red-500 hover:text-white"
                      >
                        <Globe className="h-4 w-4 mr-2" />
                        Unpublish
                      </Button>
                    </div>
                  </div>
                ))}
                {collections && !collections.some(c => c.publishedUrl) && (
                  <div className="text-center text-slate-300 py-8">
                    No published collections yet
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Hashnode Integration */}
          <Card className="bg-[#1c1c1e] border-0">
            <CardHeader>
              <CardTitle className="text-white">Hashnode Integration</CardTitle>
              <CardDescription className="text-slate-300">
                Configure your Hashnode publication settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium mb-2 text-white">
                  Personal Access Token
                </label>
                <Input
                  type="password"
                  placeholder="Enter your Hashnode Personal Access Token"
                  className="bg-[#2f2f2d] border-slate-600 text-white placeholder:text-slate-400"
                />
                <p className="text-sm text-slate-300">
                  Get your token from{' '}
                  <a 
                    href="https://hashnode.com/settings/developer"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#E669E8] hover:text-[#d15dd3]"
                  >
                    Hashnode Developer Settings
                  </a>
                </p>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium mb-2 text-white">
                  Publication ID
                </label>
                <Input
                  type="text"
                  placeholder="Enter your Hashnode publication ID"
                  className="bg-[#2f2f2d] border-slate-600 text-white placeholder:text-slate-400"
                />
                <p className="text-sm text-slate-300">
                  Found in your Hashnode publication settings
                </p>
              </div>

              <Button className="bg-[#E669E8] hover:bg-[#d15dd3] text-white">
                Save Hashnode Settings
              </Button>
            </CardContent>
          </Card>

          {/* Dev.to Integration */}
          <Card className="bg-[#1c1c1e] border-0">
            <CardHeader>
              <CardTitle className="text-white">Dev.to Integration</CardTitle>
              <CardDescription className="text-slate-300">
                Configure your Dev.to API settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium mb-2 text-white">
                  API Key
                </label>
                <Input
                  type="password"
                  placeholder="Enter your Dev.to API key"
                  className="bg-[#2f2f2d] border-slate-600 text-white placeholder:text-slate-400"
                />
                <p className="text-sm text-slate-300">
                  Get your API key from{' '}
                  <a 
                    href="https://dev.to/settings/extensions"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#E669E8] hover:text-[#d15dd3]"
                  >
                    Dev.to Settings
                  </a>
                </p>
              </div>

              <Button className="bg-[#E669E8] hover:bg-[#d15dd3] text-white">
                Save Dev.to Settings
              </Button>
            </CardContent>
          </Card>

          {/* General Settings */}
          <Card className="bg-[#1c1c1e] border-0">
            <CardHeader>
              <CardTitle className="text-white">General Settings</CardTitle>
              <CardDescription className="text-slate-300">
                Configure general application settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-slate-300">
                Additional settings are in development.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}