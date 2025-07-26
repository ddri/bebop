// Core exports
export { BasePlatformClient } from './core/platform-client';
export { BaseContentAdapter } from './core/content-adapter';
export { Publisher } from './core/publisher';

// Type exports
export type {
  PlatformClient,
  ContentAdapter,
  PlatformCredentials,
  PlatformConfig,
  PlatformMetadata,
  AdaptedContent,
  PublishResult,
  ValidationResult,
  ContentInput,
  MediaAttachment,
  AdaptationOptions,
  QueueItem,
} from './types/platform';

export type {
  BaseContent,
  HashnodeContent,
  DevToContent,
  BlueskyContent,
  MastodonContent,
} from './types/content';

// Error exports
export {
  PlatformError,
  AuthenticationError,
  ValidationError,
  PublishingError,
} from './types/platform';

// Schema exports
export {
  BaseContentSchema,
  MediaAttachmentSchema,
  AdaptedContentSchema,
  HashnodeContentSchema,
  DevToContentSchema,
  BlueskyContentSchema,
  MastodonContentSchema,
  ContentLimits,
} from './types/content';

// Platform implementations
export {
  HashnodeClient,
  HashnodeAdapter,
  type HashnodeCredentials,
  type HashnodeConfig,
  type HashnodePost,
  type HashnodePublication,
  type HashnodeSeries,
  HashnodeCredentialsSchema,
  HashnodeConfigSchema,
  HASHNODE_API_ENDPOINT,
} from './platforms/hashnode';

// Dev.to platform implementation
export {
  DevtoClient,
  DevtoAdapter,
  type DevtoCredentials,
  type DevtoConfig,
  type DevtoArticle,
  DevtoCredentialsSchema,
  DevtoConfigSchema,
  DEVTO_API_ENDPOINT,
  DEVTO_PLATFORM,
} from './platforms/devto';

// Bluesky platform implementation
export {
  BlueskyClient,
  BlueskyAdapter,
  type BlueskyCredentials,
  type BlueskyConfig,
  type BlueskyPost,
  BlueskyCredentialsSchema,
  BlueskyConfigSchema,
  BLUESKY_PLATFORM,
} from './platforms/bluesky';

// Mastodon platform implementation
export {
  MastodonClient,
  MastodonAdapter,
  type MastodonCredentials,
  type MastodonConfig,
  type MastodonStatusInput,
  MastodonCredentialsSchema,
  MastodonConfigSchema,
  MASTODON_PLATFORM,
} from './platforms/mastodon';