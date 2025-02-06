// components/social/SocialTest.tsx
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { BlueskyClient } from '@/lib/social/clients/BlueskyClient';
import { useSocialSettings } from '@/hooks/useSocialSettings';

export function SocialTest() {
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const { credentials } = useSocialSettings();
  const client = new BlueskyClient();

  const testNetworkError = async () => {
    try {
      // Force network error by using invalid URL
      const badClient = new BlueskyClient();
      badClient['agent'].service = 'https://invalid.url';
      await badClient.authenticate(credentials.bluesky || {});
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error');
    }
  };

  const testInvalidCredentials = async () => {
    try {
      await client.authenticate({
        identifier: 'test@test.com',
        password: 'wrongpassword'
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Auth error');
    }
  };

  const testCharacterLimit = async () => {
    try {
      await client.authenticate(credentials.bluesky || {});
      await client.share({
        title: 'Test Post',
        text: 'a'.repeat(301),
        url: 'https://test.com'
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Length error');
    }
  };

  const testRateLimit = async () => {
    try {
      await client.authenticate(credentials.bluesky || {});
      for (let i = 0; i < 5; i++) {
        await client.share({
          title: `Test ${i}`,
          text: 'Rate limit test',
          url: 'https://test.com'
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Rate limit error');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Social Integration Tests</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Button onClick={testNetworkError}>Test Network Error</Button>
          <Button onClick={testInvalidCredentials}>Test Invalid Credentials</Button>
          <Button onClick={testCharacterLimit}>Test Character Limit</Button>
          <Button onClick={testRateLimit}>Test Rate Limit</Button>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {status && (
          <Alert>
            <AlertDescription>{status}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}