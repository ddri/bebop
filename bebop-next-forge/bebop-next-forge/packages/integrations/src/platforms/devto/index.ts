export { DevtoClient } from './client';
export { DevtoAdapter } from './adapter';
export * from './types';

// Platform registry entry for Dev.to
export const DEVTO_PLATFORM = {
  id: 'DEVTO' as const,
  name: 'Dev.to',
  description: 'Developer community platform',
  website: 'https://dev.to',
  authType: 'api-key' as const,
  features: {
    publishing: true,
    updating: true,
    deleting: false, // Dev.to API doesn't support article deletion
    drafts: true,
    scheduling: false, // Dev.to doesn't support scheduled publishing via API
    series: true,
    tags: true,
    coverImages: true,
    canonicalUrls: true,
  },
  limits: {
    titleLength: 255,
    maxTags: 4,
    articlesPerDay: 10, // Dev.to rate limit
  },
} as const;
