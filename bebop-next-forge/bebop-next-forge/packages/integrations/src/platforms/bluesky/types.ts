import { z } from 'zod';

/**
 * Bluesky AT Protocol endpoint
 */
export const BLUESKY_API_ENDPOINT = 'https://bsky.social';

/**
 * Bluesky authentication credentials schema
 */
export const BlueskyCredentialsSchema = z.object({
  identifier: z.string().min(1, 'Handle or email is required'),
  password: z.string().min(1, 'App password is required'),
});

/**
 * Bluesky platform configuration schema
 */
export const BlueskyConfigSchema = z.object({
  languages: z.array(z.string()).optional(),
  threadMode: z.boolean().optional().default(false),
  includeImages: z.boolean().optional().default(true),
  autoDetectFacets: z.boolean().optional().default(true),
}).optional().default({});

/**
 * Bluesky post input schema for API validation
 */
export const BlueskyPostInputSchema = z.object({
  text: z.string().min(1, 'Post text is required'),
  langs: z.array(z.string()).optional(),
  facets: z.array(z.any()).optional(), // Facets for mentions, links, hashtags
  embed: z.object({
    $type: z.string(),
    images: z.array(z.object({
      image: z.any(), // Blob reference
      alt: z.string(),
    })).max(4, 'Maximum 4 images allowed').optional(),
    external: z.object({
      uri: z.string().url(),
      title: z.string(),
      description: z.string(),
      thumb: z.any().optional(), // Blob reference
    }).optional(),
  }).optional(),
  reply: z.object({
    root: z.object({
      uri: z.string(),
      cid: z.string(),
    }),
    parent: z.object({
      uri: z.string(),
      cid: z.string(),
    }),
  }).optional(),
  createdAt: z.string(),
});

// Type definitions
export type BlueskyCredentials = z.infer<typeof BlueskyCredentialsSchema>;
export type BlueskyConfig = z.infer<typeof BlueskyConfigSchema>;
export type BlueskyPostInput = z.infer<typeof BlueskyPostInputSchema>;

/**
 * Bluesky AT Protocol response structures
 */
export interface BlueskyApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  errors?: string[];
}

export interface BlueskyPost {
  uri: string;
  cid: string;
  author: BlueskyProfile;
  record: {
    text: string;
    createdAt: string;
    langs?: string[];
    facets?: BlueskyFacet[];
    embed?: BlueskyEmbed;
    reply?: BlueskyReplyRef;
  };
  embed?: BlueskyEmbed;
  replyCount: number;
  repostCount: number;
  likeCount: number;
  indexedAt: string;
  viewer?: {
    repost?: string;
    like?: string;
  };
  labels?: BlueskyLabel[];
}

export interface BlueskyProfile {
  did: string;
  handle: string;
  displayName?: string;
  description?: string;
  avatar?: string;
  banner?: string;
  followersCount?: number;
  followsCount?: number;
  postsCount?: number;
  indexedAt?: string;
  viewer?: {
    muted?: boolean;
    blockedBy?: boolean;
    blocking?: string;
    following?: string;
    followedBy?: string;
  };
  labels?: BlueskyLabel[];
}

export interface BlueskyFacet {
  index: {
    byteStart: number;
    byteEnd: number;
  };
  features: Array<{
    $type: 'app.bsky.richtext.facet#mention' | 'app.bsky.richtext.facet#link' | 'app.bsky.richtext.facet#tag';
    did?: string; // For mentions
    uri?: string; // For links
    tag?: string; // For hashtags
  }>;
}

export interface BlueskyEmbed {
  $type: 'app.bsky.embed.images#view' | 'app.bsky.embed.external#view' | 'app.bsky.embed.record#view';
  images?: Array<{
    thumb: string;
    fullsize: string;
    alt: string;
  }>;
  external?: {
    uri: string;
    title: string;
    description: string;
    thumb?: string;
  };
  record?: BlueskyPost;
}

export interface BlueskyReplyRef {
  root: {
    uri: string;
    cid: string;
  };
  parent: {
    uri: string;
    cid: string;
  };
}

export interface BlueskyLabel {
  src: string;
  uri: string;
  cid?: string;
  val: string;
  neg?: boolean;
  cts: string;
}

export interface BlueskyBlob {
  $type: 'blob';
  ref: {
    $link: string;
  };
  mimeType: string;
  size: number;
}

export interface BlueskyUploadResponse {
  blob: BlueskyBlob;
}

export interface BlueskyCreatePostResponse {
  uri: string;
  cid: string;
}

export interface BlueskySession {
  accessJwt: string;
  refreshJwt: string;
  handle: string;
  did: string;
  email?: string;
  emailConfirmed?: boolean;
  emailAuthFactor?: boolean;
  active?: boolean;
  status?: string;
}

/**
 * Bluesky API error response
 */
export interface BlueskyErrorResponse {
  error: string;
  message: string;
}

/**
 * Bluesky rate limiting info
 */
export interface BlueskyRateLimit {
  writeOperationsPerHour: number;
  writeOperationsPerDay: number;
  httpRequestsPer5Min: number;
  sessionCreationsPer5Min: number;
  loginAttemptsPerDay: number;
}

/**
 * Bluesky metadata structure
 */
export interface BlueskyMetadata {
  profile: BlueskyProfile;
  session: {
    handle: string;
    did: string;
    active: boolean;
  };
  rateLimit: BlueskyRateLimit;
}

/**
 * Thread structure for multi-post content
 */
export interface BlueskyThread {
  posts: Array<{
    text: string;
    images?: Array<{
      data: Buffer;
      alt: string;
      mimeType: string;
    }>;
  }>;
  rootUri?: string;
  rootCid?: string;
}

/**
 * Bluesky content limits and constraints
 */
export const BLUESKY_LIMITS = {
  // No specific character limit mentioned in docs, but practical limits exist
  maxTextLength: 300, // Common practical limit
  maxImagesPerPost: 4,
  maxImageSize: 1000000, // 1MB in bytes
  maxThreadLength: 25, // Reasonable thread limit
  supportedImageTypes: ['image/jpeg', 'image/png', 'image/gif'],
  rateLimit: {
    writeOperationsPerHour: 5000,
    writeOperationsPerDay: 35000,
    httpRequestsPer5Min: 3000,
    sessionCreationsPer5Min: 30,
    loginAttemptsPerDay: 100,
  },
} as const;