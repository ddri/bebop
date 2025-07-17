// lib/social/clients/index.ts
import { BlueskyClient } from './BlueskyClient';
import { MastodonClient } from './MastodonClient';
import { PlatformId } from '@/types/social';

export const SOCIAL_CLIENTS: Record<PlatformId, typeof BlueskyClient | typeof MastodonClient | null> = {
  bluesky: BlueskyClient,
  mastodon: MastodonClient,
  threads: null // Web intent only, no client needed
};