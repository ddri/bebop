'use client';

import { usePathname } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { CardSkeleton } from '@/components/ui/loading';
import { Upload } from 'lucide-react';
import Layout from '@/components/Layout';

// Lazy load heavy settings components
const TemplateManager = dynamic(() => import('@/components/templates/TemplateManager').then(mod => ({ default: mod.TemplateManager })), {
  loading: () => <CardSkeleton className="h-32" />
});

const HashnodeSettingsForm = dynamic(() => import('@/components/settings/HashnodeSettingsForm').then(mod => ({ default: mod.HashnodeSettingsForm })), {
  loading: () => <CardSkeleton className="h-48" />
});

const DevToSettingsForm = dynamic(() => import('@/components/settings/DevToSettingsForm').then(mod => ({ default: mod.DevToSettingsForm })), {
  loading: () => <CardSkeleton className="h-48" />
});

const SocialSettingsForm = dynamic(() => import('@/components/settings/SocialSettingsForm'), {
  loading: () => <CardSkeleton className="h-64" />
});

const GitHubSettingsForm = dynamic(() => import('@/components/settings/GitHubSettingsForm').then(mod => ({ default: mod.GitHubSettingsForm })), {
  loading: () => <CardSkeleton className="h-48" />
});

export default function Settings() {
  const pathname = usePathname();

  return (
    <Layout pathname={pathname}>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-semibold mb-8 text-white">Settings</h1>
        
        <div className="space-y-6">
          {/* Template Manager */}
          <TemplateManager />

          {/* GitHub Settings */}
          <GitHubSettingsForm />

          {/* File Import */}
          <Card className="bg-[#1c1c1e] border-0">
            <CardHeader>
              <CardTitle className="text-white">Import Content</CardTitle>
              <CardDescription className="text-slate-300">
                Import existing Markdown files into your Topics library
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border-2 border-dashed border-slate-600 rounded-lg p-6">
                  <div className="text-center">
                    <Button
                      variant="outline"
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
          <SocialSettingsForm />

          {/* Publishing Status (Coming Soon) */}
          <Card className="bg-[#1c1c1e] border-0">
            <CardHeader>
              <CardTitle className="text-white">Publishing Status</CardTitle>
              <CardDescription className="text-slate-300">
                Campaign-based publishing status will be available soon
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center text-slate-300 py-8">
                Publishing status tracking coming soon with campaign integration
              </div>
            </CardContent>
          </Card>

          {/* Hashnode Integration */}
          <HashnodeSettingsForm />

          {/* Dev.to Integration */}
          <DevToSettingsForm />

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