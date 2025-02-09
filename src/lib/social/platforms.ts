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
    credentialFields: ['identifier', 'password'],
    webIntent: false
  },
  mastodon: {
    id: 'mastodon',
    name: 'Mastodon',
    icon: MastodonIcon,
    color: 'rgb(99, 100, 255)',
    requiresAuth: true,
    credentialFields: ['instanceUrl', 'token'],
    helpText: 'You can find your access token in your Mastodon instance settings under Development > Applications',
    placeholders: {
      instanceUrl: 'https://mastodon.social',
      token: 'Your access token'
    },
    webIntent: false
  },
  threads: {
    id: 'threads',
    name: 'Threads',
    icon: ThreadsIcon,
    color: 'rgb(0, 0, 0)',
    requiresAuth: false,
    credentialFields: [],
    webIntent: true,
    intentUrl: 'https://threads.net/intent/post'
  }
};