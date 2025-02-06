// components/social/SocialPublisher.tsx
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';
import { AlertCircle } from 'lucide-react';
import { BlueskyIcon } from './icons/BlueskyIcon';
import { useSocialShare } from '@/hooks/useSocialShare';
import { useSocialSettings } from '@/hooks/useSocialSettings';
import { PlatformId, SocialShareContent } from '@/types/social';
import { BlueskyClient } from '@/lib/social/clients/BlueskyClient';
import { PLATFORMS } from '@/lib/social/platforms';

interface SocialPublisherProps {
  platformId: PlatformId;
  collection: {
    id: string;
    name: string;
    description?: string;
    publishedUrl?: string;
  };
  onSuccess: (url: string) => void;
  onClose: () => void;
}

export function SocialPublisher({
  platformId,
  collection,
  onSuccess,
  onClose
}: SocialPublisherProps) {
  const { platform, isLoading, error, share } = useSocialShare(platformId);
  const socialSettings = useSocialSettings();
  const [client] = useState(() => new BlueskyClient());
  const [credentials, setCredentials] = useState(socialSettings.credentials[platformId] || {});
  const [status, setStatus] = useState({ message: '', type: '' as 'error' | 'success' | '' });

  const handleShare = async () => {
    if (!collection.publishedUrl) {
      setStatus({ type: 'error', message: 'Collection must be published first' });
      return;
    }

    try {
      if (!client.isAuthenticated()) {
        await client.authenticate(credentials);
      }

      const content: SocialShareContent = {
        title: collection.name,
        text: collection.description || '',
        url: collection.publishedUrl
      };

      const response = await share(client, content);
      if (response.success) {
        socialSettings.setCredentials(platformId, credentials);
        onSuccess(response.url || '');
      }
    } catch (error) {
      setStatus({
        type: 'error',
        message: error instanceof Error ? error.message : 'Share failed'
      });
    }
  };

  return (
    <Card className="w-full border-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BlueskyIcon className="h-5 w-5" />
          Share on {platform.name}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {platform.credentialFields.map(field => (
          <div key={field} className="space-y-2">
            <Label htmlFor={field}>{field}</Label>
            <Input
              id={field}
              type={field.includes('password') ? 'password' : 'text'}
              value={credentials[field] || ''}
              onChange={(e) => setCredentials(prev => ({
                ...prev,
                [field]: e.target.value
              }))}
              placeholder={`Enter your ${field}`}
            />
          </div>
        ))}

        {(status.message || error) && (
          <Alert variant={status.type === 'error' ? 'destructive' : 'default'}>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{status.message || error}</AlertDescription>
          </Alert>
        )}
      </CardContent>

      <CardFooter className="flex justify-end gap-2">
        <Button 
          variant="outline" 
          onClick={onClose}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button 
          onClick={handleShare}
          disabled={isLoading || !collection.publishedUrl}
          style={{ backgroundColor: platform.color }}
          className="text-white"
        >
          {isLoading ? 'Sharing...' : 'Share'}
        </Button>
      </CardFooter>
    </Card>
  );
}