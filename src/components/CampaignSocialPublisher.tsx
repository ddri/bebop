import React, { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';
import { AlertCircle } from 'lucide-react';
import { useSocialSettings } from '@/hooks/useSocialSettings';
import { PLATFORMS } from '@/lib/social/platforms';
import { PlatformId } from '@/types/social';
import { BlueskyIcon } from './social/icons/BlueskyIcon';
import { MastodonIcon } from './social/icons/MastodonIcon';

interface CampaignSocialPublisherProps {
  platformId: PlatformId;
  publishingPlan: {
    id: string;
    topicId: string;
    platform: string;
  };
  content: string;
  campaignId: string;
  onSuccess: (url: string) => void;
  onClose: () => void;
}

export function CampaignSocialPublisher({
  platformId,
  publishingPlan,
  content,
  campaignId: _campaignId,
  onSuccess,
  onClose
}: CampaignSocialPublisherProps) {
  const platform = PLATFORMS[platformId];
  const { credentials, setCredentials } = useSocialSettings();
  const [inputValues, setInputValues] = useState(credentials[platformId] || {});
  const [status, setStatus] = useState<{ type: 'error' | 'success' | ''; message: string }>({
    type: '',
    message: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const handlePublish = async () => {
    setIsLoading(true);
    setStatus({ type: '', message: '' });

    try {
      // Share to the social platform
      const shareResponse = await fetch('/api/social/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platformId,
          credentials: inputValues,
          content: {
            text: content,
          }
        })
      });

      const data = await shareResponse.json();

      if (!shareResponse.ok) {
        throw new Error(data.error || 'Failed to publish');
      }

      // Update publishing plan status
      await fetch(`/api/publishing-plans/${publishingPlan.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'published',
          publishedAt: new Date(),
          publishedUrl: data.url
        })
      });

      // Save credentials for future use
      setCredentials(platformId, inputValues);
      onSuccess(data.url);
    } catch (error) {
      setStatus({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to publish'
      });

      // Update plan status to failed
      await fetch(`/api/publishing-plans/${publishingPlan.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'failed'
        })
      });
    } finally {
      setIsLoading(false);
    }
  };

  const PlatformIcon = platform.id === 'bluesky' ? BlueskyIcon : MastodonIcon;

  return (
    <Card className="w-full border-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PlatformIcon className="h-5 w-5" />
          Publish to {platform.name}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {platform.credentialFields.map(field => (
          <div key={field} className="space-y-2">
            <Label>{field.charAt(0).toUpperCase() + field.slice(1)}</Label>
            <Input
              type={field.includes('password') || field.includes('token') ? 'password' : 'text'}
              value={inputValues[field] || ''}
              onChange={(e) => setInputValues(prev => ({
                ...prev,
                [field]: e.target.value
              }))}
              placeholder={platform.placeholders?.[field] || `Enter your ${field}`}
              className="bg-[#2f2f2d] border-slate-700 text-white"
            />
          </div>
        ))}

        {platform.helpText && (
          <div className="flex items-start gap-2 text-sm text-yellow-500">
            <AlertCircle className="h-4 w-4 mt-0.5" />
            <p dangerouslySetInnerHTML={{ __html: platform.helpText }} />
          </div>
        )}

        {status.message && (
          <Alert variant={status.type === 'error' ? 'destructive' : 'default'}>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{status.message}</AlertDescription>
          </Alert>
        )}
      </CardContent>

      <CardFooter className="flex justify-end gap-2">
        <Button 
          variant="outline" 
          onClick={onClose}
          disabled={isLoading}
          className="border-slate-700 text-white hover:bg-[#2f2f2d]"
        >
          Cancel
        </Button>
        <Button 
          onClick={handlePublish}
          disabled={isLoading || !platform.credentialFields.every(field => inputValues[field])}
          className="bg-[#E669E8] hover:bg-[#d15dd3] text-white"
        >
          {isLoading ? 'Publishing...' : 'Publish'}
        </Button>
      </CardFooter>
    </Card>
  );
}