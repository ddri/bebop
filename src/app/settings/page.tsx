'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Upload } from 'lucide-react';
import Layout from '@/components/Layout';

export default function Settings() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [hashnodeToken, setHashnodeToken] = useState('');
  const [publicationId, setPublicationId] = useState('');
  const [mediumToken, setMediumToken] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  // Load collections and settings on mount
  useEffect(() => {
    if (mounted && typeof window !== 'undefined') {
      const savedToken = localStorage.getItem('hashnodeToken');
      const savedPubId = localStorage.getItem('hashnodePublicationId');
      const savedMediumToken = localStorage.getItem('mediumToken');
      
      if (savedToken) setHashnodeToken(savedToken);
      if (savedPubId) setPublicationId(savedPubId);
      if (savedMediumToken) setMediumToken(savedMediumToken);
    }
  }, [mounted]);

  const saveHashnodeSettings = () => {
    localStorage.setItem('hashnodeToken', hashnodeToken);
    localStorage.setItem('hashnodePublicationId', publicationId);
    alert('Hashnode settings saved successfully');
  };

  const saveMediumSettings = () => {
    localStorage.setItem('mediumToken', mediumToken);
    alert('Medium settings saved successfully');
  };

  if (!mounted) return null;

  return (
    <Layout pathname={pathname}>
      <h1 className="text-2xl font-semibold dark:text-white mb-8">Settings</h1>
      
      <div className="grid gap-6">
        {/* Hashnode Integration */}
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

        {/* Medium Integration */}
        <Card>
          <CardHeader>
            <CardTitle>Medium Integration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium mb-2">
                Integration Token
              </label>
              <Input
                type="password"
                value={mediumToken}
                onChange={(e) => setMediumToken(e.target.value)}
                placeholder="Enter your Medium Integration Token"
              />
              <p className="text-sm text-slate-500">
                Get your integration token from{' '}
                <a 
                  href="https://medium.com/me/settings"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  Medium Settings
                </a>
              </p>
            </div>

            <Button
              onClick={saveMediumSettings}
              className="bg-yellow-400 hover:bg-yellow-500 text-black"
            >
              Save Medium Settings
            </Button>
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
    </Layout>
  );
}