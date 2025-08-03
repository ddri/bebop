// Export all platform integrations
export * from './hashnode/index.js';
export * from './devto/index.js';
export * from './bluesky/index.js';
export * from './mastodon/index.js';

// Platform registry
export const SUPPORTED_PLATFORMS = {
  HASHNODE: () => import('./hashnode/index.js'),
  DEVTO: () => import('./devto/index.js'),
  BLUESKY: () => import('./bluesky/index.js'),
  MASTODON: () => import('./mastodon/index.js'),
} as const;

export type SupportedPlatform = keyof typeof SUPPORTED_PLATFORMS;
