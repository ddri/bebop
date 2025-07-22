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

// Future platform implementations
// export { DevToClient } from './platforms/devto/client';
// export { DevToAdapter } from './platforms/devto/adapter';
// export { BlueskyClient } from './platforms/bluesky/client';
// export { BlueskyAdapter } from './platforms/bluesky/adapter';
// export { MastodonClient } from './platforms/mastodon/client';
// export { MastodonAdapter } from './platforms/mastodon/adapter';