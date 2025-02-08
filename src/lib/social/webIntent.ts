// lib/social/webIntent.ts
import { PlatformId } from '@/types/social';
import { PLATFORMS } from './platforms';

interface WebIntentParams {
  text?: string;
  url?: string;
  title?: string;
}

export const shareViaWebIntent = (platformId: PlatformId, params: WebIntentParams) => {
  const platform = PLATFORMS[platformId];
  if (!platform.webIntent || !platform.intentUrl) {
    throw new Error(`Platform ${platformId} does not support web intents`);
  }

  const url = new URL(platform.intentUrl);
  
  if (params.text) url.searchParams.append('text', params.text);
  if (params.url) url.searchParams.append('url', params.url);
  if (params.title) url.searchParams.append('title', params.title);

  window.open(url.toString(), '_blank', 'noopener,noreferrer');
};