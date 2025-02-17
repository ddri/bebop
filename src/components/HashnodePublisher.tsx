import React, { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';
import { AlertCircle } from 'lucide-react';
import { useHashnodeSettings } from '@/hooks/useHashnodeSettings';

interface HashnodePublisherProps {
  type: 'collection' | 'publishingPlan';
  itemId: string;
  name: string;
  description?: string;
  content: string;
  onSuccess: (url: string) => void;
  onClose: () => void;
}

interface HashnodeTag {
  slug: string;
  name: string;
}

export function HashnodePublisher({
  type,
  itemId,
  name,
  description,
  content,
  onSuccess,
  onClose
}: HashnodePublisherProps) {
  const { getSettings } = useHashnodeSettings();
  const savedSettings = getSettings();
  const [apiKey, setApiKey] = useState(savedSettings.token);
  const [publicationId, setPublicationId] = useState(savedSettings.publicationId);
  const [status, setStatus] = useState<{ type: 'error' | 'success' | ''; message: string }>({
    type: '',
    message: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const publishToHashnode = async () => {
    setIsLoading(true);
    setStatus({ type: '', message: '' });
    console.log('Starting publish to Hashnode...', {
      title: name,
      contentLength: content.length,
      publicationId
    });

    try {
      const tags: HashnodeTag[] = [{
        slug: "bebop",
        name: "Bebop"
      }];

      const mutation = {
        query: `
          mutation PublishPost(
            $title: String!
            $contentMarkdown: String!
            $publicationId: ObjectId!
            $tags: [PublishPostTagInput!]!
          ) {
            publishPost(
              input: {
                title: $title
                contentMarkdown: $contentMarkdown
                publicationId: $publicationId
                tags: $tags
              }
            ) {
              post {
                id
                url
              }
            }
          }
        `,
        variables: {
          title: name,
          contentMarkdown: content,
          publicationId,
          tags
        }
      };

      console.log('Sending request to Hashnode:', mutation);

      const response = await fetch('https://gql.hashnode.com', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': apiKey
        },
        body: JSON.stringify(mutation)
      });

      const data = await response.json();
      console.log('Hashnode response:', data);

      if (data.errors) {
        throw new Error(data.errors[0].message);
      }

      const url = data.data?.publishPost?.post?.url;
      if (!url) {
        throw new Error('No URL returned from Hashnode');
      }

      // Update database based on type
      if (type === 'collection') {
        await fetch(`/api/collections/${itemId}/hashnode`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ hashnodeUrl: url })
        });
      } else if (type === 'publishingPlan') {
        await fetch(`/api/publishing-plans/${itemId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            hashnodeUrl: url,
            publishedUrl: url,
            status: 'published',
            publishedAt: new Date()
          })
        });
      }

      setStatus({
        type: 'success',
        message: 'Successfully published to Hashnode!'
      });

      onSuccess(url);
    } catch (error) {
      console.error('Publishing error:', error);
      setStatus({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to publish to Hashnode'
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
            viewBox="0 0 337 337" 
            fill="currentColor"
          >
            <path d="M168.5,0C75.45,0,0,75.45,0,168.5S75.45,337,168.5,337S337,261.55,337,168.5S261.55,0,168.5,0z M168.5,304.5  c-75.11,0-136-60.89-136-136s60.89-136,136-136s136,60.89,136,136S243.61,304.5,168.5,304.5z"/>
          </svg>
          Publish to Hashnode
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {!savedSettings.token || !savedSettings.publicationId ? (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Hashnode credentials not found. Please add them in the{' '}
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
              <Label htmlFor="apiKey">Personal Access Token</Label>
              <Input
                id="apiKey"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
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
              <Label htmlFor="publicationId">Publication ID</Label>
              <Input
                id="publicationId"
                value={publicationId}
                onChange={(e) => setPublicationId(e.target.value)}
                placeholder="Enter your Hashnode publication ID"
              />
              <p className="text-sm text-slate-500">
                Found in your Hashnode publication settings
              </p>
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
          onClick={publishToHashnode}
          disabled={isLoading || !apiKey || !publicationId}
          className="bg-yellow-400 hover:bg-yellow-500 text-black"
        >
          {isLoading ? 'Publishing...' : 'Publish'}
        </Button>
      </CardFooter>
    </Card>
  );
}