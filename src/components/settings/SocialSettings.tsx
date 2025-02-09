// components/settings/SocialSettings.tsx
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSocialSettings } from '@/hooks/useSocialSettings';
import { PLATFORMS } from '@/lib/social/platforms';
import { BlueskyIcon } from '../social/icons/BlueskyIcon';
import { MastodonIcon } from '../social/icons/MastodonIcon';
import { ThreadsIcon } from '../social/icons/ThreadsIcon';
import { AlertCircle } from 'lucide-react';
import { PlatformId, SocialCredentials } from '@/types/social';

const PlatformIcon = ({ platform }: { platform: PlatformId }) => {
  switch (platform) {
    case 'bluesky':
      return <BlueskyIcon className="h-5 w-5" />;
    case 'mastodon':
      return <MastodonIcon className="h-5 w-5" />;
    case 'threads':
      return <ThreadsIcon className="h-5 w-5" />;
    default:
      return null;
  }
};

export function SocialSettings() {
  const { credentials, setCredentials, clearCredentials } = useSocialSettings();

  const handleSave = (platform: PlatformId, values: SocialCredentials) => {
    // Convert any undefined values to empty strings
    const cleanValues = Object.fromEntries(
      Object.entries(values).map(([key, value]) => [key, value ?? ''])
    );
    setCredentials(platform, cleanValues);
  };

  const handleClear = (platform: PlatformId) => {
    clearCredentials(platform);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Social Integration Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {Object.entries(PLATFORMS).map(([id, platform]) => (
          <div key={id} className="space-y-4 pb-4 border-b last:border-0">
            <div className="flex items-center gap-2">
              <PlatformIcon platform={platform.id as PlatformId} />
              <h3 className="font-medium">{platform.name}</h3>
            </div>
            
            {platform.credentialFields.map(field => (
              <div key={field} className="space-y-2">
                <Label>{field.charAt(0).toUpperCase() + field.slice(1)}</Label>
                <Input
                  type={field.includes('password') || field.includes('token') ? 'password' : 'text'}
                  value={credentials[platform.id as PlatformId]?.[field] || ''}
                  onChange={(e) => {
                    const values = {
                      ...(credentials[platform.id as PlatformId] || {}),
                      [field]: e.target.value
                    };
                    handleSave(platform.id as PlatformId, values);
                  }}
                  placeholder={`Enter your ${field}`}
                />
              </div>
            ))}

            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => handleClear(platform.id as PlatformId)}
              >
                Clear Credentials
              </Button>
            </div>

            {platform.id === 'bluesky' && (
              <div className="flex items-start gap-2 text-sm text-yellow-500 dark:text-yellow-400">
                <AlertCircle className="h-4 w-4 mt-0.5" />
                <p>
                  Create an app-specific password in your{' '}
                  <a 
                    href="https://bsky.app/settings/app-passwords"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline"
                  >
                    Bluesky Settings
                  </a>
                  . Never use your main account password.
                </p>
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}