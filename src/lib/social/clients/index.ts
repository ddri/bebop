// lib/social/clients/index.ts
import { BlueskyClient } from './BlueskyClient';
import { MastodonClient } from './MastodonClient';
import { PlatformId } from '@/types/social';

export const SOCIAL_CLIENTS: Record<PlatformId, any> = {
  bluesky: BlueskyClient,
  mastodon: MastodonClient,
  threads: null // Web intent only, no client needed
};