import type { DestinationType } from '@repo/database/types';

// Base platform authentication
export interface PlatformCredentials {
  type: 'api-key' | 'oauth' | 'bearer-token' | 'username-password';
  data: Record<string, string>;
}

// Platform metadata (publications, instance URLs, etc.)
export interface PlatformMetadata {
  [key: string]: unknown;
}

// Platform-specific configuration
export interface PlatformConfig {
  [key: string]: unknown;
}

// Publishing result from platform
export interface PublishResult {
  success: boolean;
  platformPostId?: string;
  platformUrl?: string;
  error?: string;
  response?: Record<string, unknown>;
}

// Validation result
export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

// Content adaptation options
export interface AdaptationOptions {
  platform: DestinationType;
  maxLength?: number;
  includeMedia?: boolean;
  formatting?: 'markdown' | 'html' | 'plain';
  hashtagStrategy?: 'preserve' | 'optimize' | 'remove';
}

// Adapted content for a specific platform
export interface AdaptedContent {
  title?: string;
  body: string;
  excerpt?: string;
  tags?: string[];
  metadata?: Record<string, unknown>;
  media?: MediaAttachment[];
}

// Media attachment
export interface MediaAttachment {
  url: string;
  altText?: string;
  caption?: string;
  type: 'image' | 'video' | 'audio' | 'document';
}

// Base platform client interface
export interface PlatformClient {
  readonly platform: DestinationType;

  // Authentication
  authenticate(credentials: PlatformCredentials): Promise<void>;
  validateCredentials(
    credentials: PlatformCredentials
  ): Promise<ValidationResult>;

  // Publishing
  publish(
    content: AdaptedContent,
    config?: PlatformConfig
  ): Promise<PublishResult>;
  update(
    id: string,
    content: AdaptedContent,
    config?: PlatformConfig
  ): Promise<PublishResult>;
  delete(id: string): Promise<PublishResult>;

  // Metadata
  getMetadata(): Promise<PlatformMetadata>;
  validateContent(content: AdaptedContent): ValidationResult;
}

// Content adapter interface
export interface ContentAdapter {
  readonly platform: DestinationType;

  // Content transformation
  adaptContent(
    content: ContentInput,
    options: AdaptationOptions
  ): Promise<AdaptedContent>;
  extractSocialTeaser(content: ContentInput): string;
  optimizeTags(tags: string[], platform: DestinationType): string[];

  // Validation
  validateContent(content: AdaptedContent): ValidationResult;

  // Media handling
  optimizeMedia(media: MediaAttachment[]): Promise<MediaAttachment[]>;
}

// Input content from our database
export interface ContentInput {
  title: string;
  body: string;
  excerpt?: string;
  type: string;
  metadata?: Record<string, unknown>;
  mediaIds?: string[];
}

// Publishing queue item
export interface QueueItem {
  scheduleId: string;
  destinationId: string;
  contentId: string;
  scheduledFor: Date;
  retryCount: number;
  maxRetries: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
}

// Error types
export class PlatformError extends Error {
  constructor(
    message: string,
    public platform: DestinationType,
    public code?: string,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'PlatformError';
  }
}

export class AuthenticationError extends PlatformError {
  constructor(platform: DestinationType, message = 'Authentication failed') {
    super(message, platform, 'AUTH_ERROR');
    this.name = 'AuthenticationError';
  }
}

export class ValidationError extends PlatformError {
  constructor(platform: DestinationType, errors: string[]) {
    super(
      `Validation failed: ${errors.join(', ')}`,
      platform,
      'VALIDATION_ERROR'
    );
    this.name = 'ValidationError';
  }
}

export class PublishingError extends PlatformError {
  constructor(
    platform: DestinationType,
    message: string,
    details?: Record<string, unknown>
  ) {
    super(message, platform, 'PUBLISHING_ERROR', details);
    this.name = 'PublishingError';
  }
}
