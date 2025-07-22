export { MastodonClient } from './client';
export { MastodonAdapter } from './adapter';
export * from './types';

// Platform registry entry for Mastodon
export const MASTODON_PLATFORM = {
  id: 'MASTODON' as const,
  name: 'Mastodon',
  description: 'Decentralized social network using ActivityPub protocol',
  website: 'https://joinmastodon.org',
  authType: 'bearer-token' as const,
  features: {
    publishing: true,
    updating: true, // Limited editing support
    deleting: true,
    drafts: false, // Mastodon posts are immediate unless scheduled
    scheduling: true,
    threads: false, // No native thread support (use replies)
    hashtags: true,
    mentions: true,
    images: true,
    videos: true,
    audio: true,
    polls: true,
    contentWarnings: true,
    visibilityControls: true,
    customEmojis: true,
  },
  limits: {
    textLength: 500, // Default, varies by instance
    maxMediaAttachments: 4,
    maxImageSize: 10485760, // 10MB default
    maxVideoSize: 41943040, // 40MB default
    maxPollOptions: 4,
    maxPollCharactersPerOption: 50,
    rateLimit: {
      requestsPerFiveMinutes: 300,
      mediaUploadsPerThirtyMinutes: 30,
      statusDeletionsPerThirtyMinutes: 30,
    },
  },
  instanceSpecific: {
    requiresInstanceUrl: true,
    characterLimitConfigurable: true,
    mediaLimitsConfigurable: true,
    federationAware: true,
  },
} as const;