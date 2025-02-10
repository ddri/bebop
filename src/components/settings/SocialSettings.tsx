// components/settings/SocialSettings.tsx
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSocialSettings } from '@/hooks/useSocialSettings';
import { PLATFORMS } from '@/lib/social/platforms';
import { BlueskyIcon } from '../social/icons/BlueskyIcon';
import { AlertCircle } from 'lucide-react';
import { PlatformId, SocialCredentials } from '@/types/social';

export function SocialSettings() {
  const { credentials, setCredentials, clearCredentials } = useSocialSettings();

  const handleSave = (platform: PlatformId, values: SocialCredentials) => {
    setCredentials(platform, values);
  };

  const handleClear = (platform: PlatformId) => {
    clearCredentials(platform);
  };

  return (
    <Card className="bg-[#1c1c1e] border-0">
      <CardHeader>
        <CardTitle className="text-white">Social Integration Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {Object.entries(PLATFORMS).map(([id, platform]) => (
          <div key={id} className="space-y-4 pb-4 border-b border-slate-700 last:border-0">
            <div className="flex items-center gap-2 text-white">
              {platform.id === 'bluesky' && <BlueskyIcon className="h-5 w-5" />}
              <h3 className="font-medium">{platform.name}</h3>
            </div>
            
            {platform.credentialFields.map(field => (
              <div key={field} className="space-y-2">
                <Label className="text-white">{field}</Label>
                <Input
                  type={field.includes('password') ? 'password' : 'text'}
                  value={credentials[platform.id as PlatformId]?.[field] || ''}
                  onChange={(e) => {
                    const values = {
                      ...(credentials[platform.id as PlatformId] || {}),
                      [field]: e.target.value
                    };
                    handleSave(platform.id as PlatformId, values as SocialCredentials);
                  }}
                  placeholder={`Enter your ${field}`}
                  className="bg-[#2f2f2d] border-slate-600 text-white placeholder:text-slate-400 focus:border-[#E669E8] focus:ring-[#E669E8]"
                />
              </div>
            ))}

            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => handleClear(platform.id as PlatformId)}
                className="text-white border-slate-600 hover:bg-[#E669E8] hover:text-white"
              >
                Clear Credentials
              </Button>
            </div>

            {platform.id === 'bluesky' && (
              <div className="flex items-start gap-2 text-sm">
                <AlertCircle className="h-4 w-4 mt-0.5 text-[#E669E8]" />
                <p className="text-slate-300">
                  Create an app-specific password in your{' '}
                  <a 
                    href="https://bsky.app/settings/app-passwords"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#E669E8] hover:text-[#d15dd3] underline"
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