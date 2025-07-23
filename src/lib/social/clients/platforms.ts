// lib/social/platforms.ts
import { BlueskyIcon } from '@/components/social/icons/BlueskyIcon';
import { MastodonIcon } from '@/components/social/icons/MastodonIcon';
import { ThreadsIcon } from '@/components/social/icons/ThreadsIcon';
import { PlatformId, SocialPlatform } from '@/types/social';

export const PLATFORMS: Record<PlatformId, SocialPlatform> = {
  bluesky: {
    id: 'bluesky',
    name: 'Bluesky',
    icon: BlueskyIcon,
    color: 'rgb(0, 133, 255)',
    requiresAuth: true,
    credentialFields: ['identifier', 'password'],
    helpText: 'Create an app-specific password in your Bluesky settings. Never use your main account password.',
    placeholders: {
      identifier: 'Your Bluesky handle',
      password: 'Your app password'
    },
    webIntent: false
  },
  mastodon: {
    id: 'mastodon',
    name: 'Mastodon',
    icon: MastodonIcon,
    color: 'rgb(99, 100, 255)',
    requiresAuth: true,
    credentialFields: ['instanceUrl', 'accessToken'],
    helpText: 'You can find your access token in your Mastodon instance settings under Development > Applications',
    placeholders: {
      instanceUrl: 'https://mastodon.social',
      accessToken: 'Your access token'
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
} as const;