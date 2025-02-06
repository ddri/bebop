// lib/social/platforms.ts
import { BlueskyIcon } from '@/components/social/icons/BlueskyIcon';
import { MastodonIcon } from '@/components/social/icons/MastodonIcon';
import { ThreadsIcon } from '@/components/social/icons/ThreadsIcon';
import { SocialPlatform } from '@/types/social';

export const PLATFORMS: Record<string, SocialPlatform> = {  
  bluesky: {
    id: 'bluesky',
    name: 'Bluesky',
    icon: BlueskyIcon,
    color: 'rgb(0, 133, 255)',
    requiresAuth: true,
    credentialFields: ['identifier', 'password']
  },
  mastodon: {
    id: 'mastodon',
    name: 'Mastodon',
    icon: MastodonIcon,
    color: 'rgb(99, 100, 255)',
    requiresAuth: true,
    credentialFields: ['instance', 'accessToken']
  },
  threads: {
    id: 'threads',
    name: 'Threads',
    icon: ThreadsIcon,
    color: 'rgb(0, 0, 0)',
    requiresAuth: true,
    credentialFields: ['username', 'password']
  }
};