import React, { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { AlertCircle } from 'lucide-react';
import { useDevToSettings } from '@/hooks/useDevToSettings';

interface DevToPublisherProps {
  collection: {
    id: string;
    name: string;
    description?: string;
    topicIds: string[];
  };
  // We'll now get both HTML and Markdown content
  content: string;
  rawMarkdown: string;
  onSuccess: (url: string) => void;
  onClose: () => void;
}

export function DevToPublisher({
  collection,
  content,
  rawMarkdown,
  onSuccess,
  onClose
}: DevToPublisherProps) {
  const { getSettings } = useDevToSettings();
  const savedSettings = getSettings();
  const [apiKey, setApiKey] = useState(savedSettings.token);
  const [published, setPublished] = useState(false);
  const [tags, setTags] = useState('bebop');
  const [status, setStatus] = useState<{ type: 'error' | 'success' | ''; message: string }>({
    type: '',
    message: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const publishToDevTo = async () => {
    setIsLoading(true);
    setStatus({ type: '', message: '' });

    try {
      const article = {
        article: {
          title: collection.name,
          body_markdown: rawMarkdown, // Use the raw Markdown content instead of HTML
          description: collection.description,
          published,
          tags: tags.split(',').map(tag => tag.trim()),
          series: 'Bebop CMS'
        }
      };

      console.log('Publishing to Dev.to with markdown content:', {
        title: article.article.title,
        contentPreview: article.article.body_markdown.substring(0, 100) + '...',
        tags: article.article.tags
      });

      const response = await fetch('/api/publish/devto', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          article,
          apiKey
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to publish: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.url) {
        throw new Error('No URL returned from Dev.to');
      }

      setStatus({
        type: 'success',
        message: 'Successfully published to Dev.to!'
      });

      // Update collection with Dev.to URL
      await fetch(`/api/collections/${collection.id}/devto`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ devToUrl: data.url })
      });

      onSuccess(data.url);
    } catch (error) {
      console.error('Publishing error:', error);
      setStatus({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to publish to Dev.to'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full border-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <svg viewBox="0 0 448 512" className="h-5 w-5" fill="currentColor">
            <path d="M120.12 208.29c-3.88-2.9-7.77-4.35-11.65-4.35H91.03v104.47h17.45c3.88 0 7.77-1.45 11.65-4.35 3.88-2.9 5.82-7.25 5.82-13.06v-69.65c-.01-5.8-1.96-10.16-5.83-13.06zM404.1 32H43.9C19.7 32 .06 51.59 0 75.8v360.4C.06 460.41 19.7 480 43.9 480h360.2c24.21 0 43.84-19.59 43.9-43.8V75.8c-.06-24.21-19.7-43.8-43.9-43.8zM154.2 291.19c0 18.81-11.61 47.31-48.36 47.25h-46.4V172.98h47.38c35.44 0 47.36 28.46 47.37 47.28l.01 70.93zm100.68-88.66H201.6v38.42h32.57v29.57H201.6v38.41h53.29v29.57h-62.18c-11.16.29-20.44-8.53-20.72-19.69V193.7c-.27-11.15 8.56-20.41 19.71-20.69h63.19l-.01 29.52zm103.64 115.29c-13.2 30.75-36.85 24.63-47.44 0l-38.53-144.8h32.57l29.71 113.72 29.57-113.72h32.58l-38.46 144.8z"/>
          </svg>
          Publish to Dev.to
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {!savedSettings.token ? (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              No Dev.to API key found. Please add your API key in the{' '}
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
                placeholder="Enter tags (e.g., webdev, javascript)"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="published"
                checked={published}
                onCheckedChange={setPublished}
              />
              <Label htmlFor="published">
                {published ? 'Publish immediately' : 'Save as draft'}
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
          onClick={publishToDevTo}
          disabled={isLoading || !savedSettings.token}
          className="bg-yellow-400 hover:bg-yellow-500 text-black"
        >
          {isLoading ? 'Publishing...' : 'Publish'}
        </Button>
      </CardFooter>
    </Card>
  );
}