// hooks/useSocialShare.ts
import { useState, useCallback } from 'react';
import { AbstractSocialClient } from '@/lib/social/AbstractSocialClient';
import { SocialShareContent, SocialShareResponse, PlatformId } from '@/types/social';
import { PLATFORMS } from '@/lib/social/platforms';

interface UseSocialShareReturn {
  isLoading: boolean;
  error: string | null;
  share: (client: AbstractSocialClient, content: SocialShareContent) => Promise<SocialShareResponse>;
  platform: typeof PLATFORMS[PlatformId];
}

export function useSocialShare(platformId: PlatformId): UseSocialShareReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const share = useCallback(async (
    client: AbstractSocialClient,
    content: SocialShareContent
  ): Promise<SocialShareResponse> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await client.share(content);
      if (!response.success) {
        throw new Error(response.error);
      }
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Share failed';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    error,
    share,
    platform: PLATFORMS[platformId]
  };
}