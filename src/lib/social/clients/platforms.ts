// lib/social/platforms.ts
import { SocialPlatform } from '@/types/social';

export const SOCIAL_PLATFORMS: Record<string, SocialPlatform> = {
  bluesky: {
    id: 'bluesky',
    name: 'Bluesky',
    icon: BlueskyIcon,
    color: 'rgb(0, 133, 255)',
    requiresAuth: true
  },
  mastodon: {
    id: 'mastodon',
    name: 'Mastodon',
    icon: MastodonIcon,
    color: 'rgb(99, 100, 255)',
    requiresAuth: true
  },
  threads: {
    id: 'threads',
    name: 'Threads',
    icon: ThreadsIcon,
    color: 'rgb(0, 0, 0)',
    requiresAuth: true
  }
};