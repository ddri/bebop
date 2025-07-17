// components/social/SocialPublisher.tsx
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
  const platform = PLATFORMS[platformId];
  
  // All hooks must be called before any conditional returns
  const { credentials, setCredentials } = useSocialSettings();
  const [inputValues, setInputValues] = useState(credentials[platformId] || {});
  const [status, setStatus] = useState<{ type: 'error' | 'success' | ''; message: string }>({
    type: '',
    message: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  // Skip rendering for web intent platforms (like Threads)
  if (platform.webIntent) {
    return null;
  }

  // Check if collection is published
  if (!collection.publishedUrl) {
    return (
      <Card className="w-full border-0">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-yellow-500">
            <AlertCircle className="h-5 w-5" />
            <p>Collection must be published first</p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button onClick={onClose}>Close</Button>
        </CardFooter>
      </Card>
    );
  }

  const handleShare = async () => {
    setIsLoading(true);
    setStatus({ type: '', message: '' });

    try {
      // Validate collection ID
      if (!collection.id) {
        throw new Error('Collection ID is required');
      }

      // First record the share attempt
      const metricsResponse = await fetch('/api/social/metrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platformId,
          collectionId: collection.id
        })
      });

      if (!metricsResponse.ok) {
        const error = await metricsResponse.json();
        console.error('Failed to record share attempt:', error);
        // Continue with share attempt even if metrics recording fails
      }

      // Then attempt the actual share
      const shareResponse = await fetch('/api/social/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platformId,
          credentials: inputValues,
          content: {
            title: collection.name,
            text: collection.description || '',
            url: collection.publishedUrl
          }
        })
      });

      const data = await shareResponse.json();

      if (!shareResponse.ok) {
        throw new Error(data.error || 'Failed to share');
      }

      // Record the successful share with explicit collectionId
      await fetch('/api/social/metrics', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platformId,
          collectionId: collection.id,
          success: true
        })
      }).catch(error => {
        // Log but don't fail if metrics update fails
        console.error('Failed to update success metrics:', error);
      });

      setCredentials(platformId, inputValues);
      onSuccess(data.url);
    } catch (error) {
      // Record the failed share with explicit collectionId
      if (collection.id) {
        await fetch('/api/social/metrics', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            platformId,
            collectionId: collection.id,
            success: false
          })
        }).catch(error => {
          // Log but don't fail if metrics update fails
          console.error('Failed to update failure metrics:', error);
        });
      }

      setStatus({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to share'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full border-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <platform.icon className="h-5 w-5" />
          Share on {platform.name}
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
            />
          </div>
        ))}

        {platform.helpText && (
          <div className="flex items-start gap-2 text-sm text-yellow-500 dark:text-yellow-400">
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
        >
          Cancel
        </Button>
        <Button 
          onClick={handleShare}
          disabled={isLoading || !collection.publishedUrl || 
            !platform.credentialFields.every(field => inputValues[field])}
          style={{ backgroundColor: platform.color }}
          className="text-white"
        >
          {isLoading ? 'Sharing...' : 'Share'}
        </Button>
      </CardFooter>
    </Card>
  );
}