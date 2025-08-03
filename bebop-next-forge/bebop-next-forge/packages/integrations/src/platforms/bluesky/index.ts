export { BlueskyClient } from './client';
export { BlueskyAdapter } from './adapter';
export * from './types';

// Platform registry entry for Bluesky
export const BLUESKY_PLATFORM = {
  id: 'BLUESKY' as const,
  name: 'Bluesky',
  description: 'Decentralized social network using AT Protocol',
  website: 'https://bsky.app',
  authType: 'username-password' as const,
  features: {
    publishing: true,
    updating: false, // Bluesky doesn't support editing posts
    deleting: true,
    drafts: false, // Bluesky posts are immediate
    scheduling: false, // No native scheduling support
    threads: true,
    hashtags: true,
    mentions: true,
    images: true,
    links: true,
  },
  limits: {
    textLength: 300, // Practical limit for single posts
    maxImagesPerPost: 4,
    maxImageSize: 1000000, // 1MB
    maxThreadLength: 25,
    rateLimit: {
      writeOperationsPerHour: 5000,
      writeOperationsPerDay: 35000,
    },
  },
} as const;
