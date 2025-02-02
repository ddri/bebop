import React, { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { AlertCircle } from 'lucide-react';
import { useMediumSettings } from '@/hooks/useMediumSettings';

interface MediumPublisherProps {
  collection: {
    id: string;
    name: string;
    description?: string;
    topicIds: string[];
  };
  content: string;
  onSuccess: (url: string) => void;
  onClose: () => void;
}

export function MediumPublisher({
  collection,
  content,
  onSuccess,
  onClose
}: MediumPublisherProps) {
  const { getSettings } = useMediumSettings();
  const savedSettings = getSettings();
  const [apiKey, setApiKey] = useState(savedSettings.token);
  const [publishStatus, setPublishStatus] = useState<'public' | 'draft'>('draft');
  const [tags, setTags] = useState('bebop');
  const [status, setStatus] = useState<{ type: 'error' | 'success' | ''; message: string }>({
    type: '',
    message: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const publishToMedium = async () => {
    setIsLoading(true);
    setStatus({ type: '', message: '' });

    try {
      // First, get the user's ID
      const userResponse = await fetch('https://api.medium.com/v1/me', {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        }
      });

      if (!userResponse.ok) {
        throw new Error('Failed to authenticate with Medium');
      }

      const userData = await userResponse.json();
      const userId = userData.data.id;

      // Create the post
      const article = {
        title: collection.name,
        contentFormat: 'html',
        content,
        tags: tags.split(',').map(tag => tag.trim()),
        publishStatus
      };

      const createPostResponse = await fetch(`https://api.medium.com/v1/users/${userId}/posts`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(article)
      });

      if (!createPostResponse.ok) {
        const errorData = await createPostResponse.json();
        throw new Error(errorData.errors?.[0]?.message || 'Failed to publish to Medium');
      }

      const data = await createPostResponse.json();
      const postUrl = data.data.url;

      if (!postUrl) {
        throw new Error('No URL returned from Medium');
      }

      setStatus({
        type: 'success',
        message: 'Successfully published to Medium!'
      });

      // Update collection with Medium URL
      await fetch(`/api/collections/${collection.id}/medium`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mediumUrl: postUrl })
      });

      onSuccess(postUrl);
    } catch (error) {
      console.error('Publishing error:', error);
      setStatus({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to publish to Medium'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full border-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <svg 
            className="h-5 w-5" 
            viewBox="0 0 24 24" 
            fill="currentColor"
          >
            <path d="M13.54 12a6.8 6.8 0 01-6.77 6.82A6.8 6.8 0 010 12a6.8 6.8 0 016.77-6.82A6.8 6.8 0 0113.54 12zm7.42 0c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42 3.38 2.88 3.38 6.42M24 12c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75C23.47 6.25 24 8.83 24 12z"/>
          </svg>
          Publish to Medium
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {!savedSettings.token ? (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              No Medium integration token found. Please add your token in the{' '}
              <a 
                href="/settings" 
                className="text-blue-500 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Settings page
              </a>
            </AlertDescription>
          </Alert>
        ) : (
          <>
            <div className="space-y-2">
              <Label htmlFor="tags">Tags (comma-separated)</Label>
              <Input
                id="tags"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="Enter tags (e.g., programming, technology)"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="published"
                checked={publishStatus === 'public'}
                onCheckedChange={(checked) => setPublishStatus(checked ? 'public' : 'draft')}
              />
              <Label htmlFor="published">
                {publishStatus === 'public' ? 'Publish immediately' : 'Save as draft'}
              </Label>
            </div>

            {status.message && (
              <Alert variant={status.type === 'error' ? 'destructive' : 'default'}>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{status.message}</AlertDescription>
              </Alert>
            )}
          </>
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
          onClick={publishToMedium}
          disabled={isLoading || !savedSettings.token}
          className="bg-yellow-400 hover:bg-yellow-500 text-black"
        >
          {isLoading ? 'Publishing...' : 'Publish'}
        </Button>
      </CardFooter>
    </Card>
  );
}