import { z } from 'zod';

/**
 * Mastodon credentials schema - supports OAuth access token
 */
export const MastodonCredentialsSchema = z.object({
  accessToken: z.string().min(1, 'Access token is required'),
  instanceUrl: z.string().url('Valid instance URL is required'),
});

/**
 * Mastodon platform configuration schema
 */
export const MastodonConfigSchema = z
  .object({
    visibility: z
      .enum(['public', 'unlisted', 'private', 'direct'])
      .optional()
      .default('public'),
    sensitive: z.boolean().optional().default(false),
    spoilerText: z.string().optional(),
    language: z.string().optional(),
    scheduledAt: z.string().datetime().optional(),
    poll: z
      .object({
        options: z.array(z.string()).min(2).max(4),
        expiresIn: z.number().min(300).max(2629746), // 5 minutes to 1 month
        multiple: z.boolean().optional().default(false),
        hideTotals: z.boolean().optional().default(false),
      })
      .optional(),
  })
  .optional()
  .default({});

/**
 * Mastodon status input schema for API validation
 */
export const MastodonStatusInputSchema = z.object({
  status: z.string().optional(),
  mediaIds: z
    .array(z.string())
    .max(4, 'Maximum 4 media attachments')
    .optional(),
  visibility: z.enum(['public', 'unlisted', 'private', 'direct']).optional(),
  sensitive: z.boolean().optional(),
  spoilerText: z.string().optional(),
  language: z.string().optional(),
  poll: z
    .object({
      options: z.array(z.string()).min(2).max(4),
      expiresIn: z.number(),
      multiple: z.boolean().optional(),
      hideTotals: z.boolean().optional(),
    })
    .optional(),
  scheduledAt: z.string().optional(),
});

// Type definitions
export type MastodonCredentials = z.infer<typeof MastodonCredentialsSchema>;
export type MastodonConfig = z.infer<typeof MastodonConfigSchema>;
export type MastodonStatusInput = z.infer<typeof MastodonStatusInputSchema>;

/**
 * Mastodon API response structures
 */
export interface MastodonApiResponse<T = unknown> {
  data?: T;
  error?: string;
  errors?: Record<string, string[]>;
}

export interface MastodonStatus {
  id: string;
  created_at: string;
  in_reply_to_id?: string;
  in_reply_to_account_id?: string;
  sensitive: boolean;
  spoiler_text: string;
  visibility: 'public' | 'unlisted' | 'private' | 'direct';
  language?: string;
  uri: string;
  url?: string;
  replies_count: number;
  reblogs_count: number;
  favourites_count: number;
  content: string;
  text?: string;
  reblog?: MastodonStatus;
  application?: {
    name: string;
    website?: string;
  };
  account: MastodonAccount;
  media_attachments: MastodonMediaAttachment[];
  mentions: MastodonMention[];
  tags: MastodonTag[];
  emojis: MastodonEmoji[];
  card?: MastodonCard;
  poll?: MastodonPoll;
}

export interface MastodonAccount {
  id: string;
  username: string;
  acct: string;
  display_name: string;
  locked: boolean;
  bot: boolean;
  discoverable?: boolean;
  group: boolean;
  created_at: string;
  note: string;
  url: string;
  avatar: string;
  avatar_static: string;
  header: string;
  header_static: string;
  followers_count: number;
  following_count: number;
  statuses_count: number;
  last_status_at?: string;
  emojis: MastodonEmoji[];
  fields: Array<{
    name: string;
    value: string;
    verified_at?: string;
  }>;
}

export interface MastodonMediaAttachment {
  id: string;
  type: 'image' | 'video' | 'gifv' | 'audio' | 'unknown';
  url: string;
  preview_url: string;
  remote_url?: string;
  text_url?: string;
  meta?: {
    width?: number;
    height?: number;
    size?: string;
    aspect?: number;
    duration?: number;
    fps?: number;
    bitrate?: number;
    original?: {
      width?: number;
      height?: number;
      size?: string;
      aspect?: number;
    };
    small?: {
      width?: number;
      height?: number;
      size?: string;
      aspect?: number;
    };
  };
  description?: string;
  blurhash?: string;
}

export interface MastodonMention {
  id: string;
  username: string;
  url: string;
  acct: string;
}

export interface MastodonTag {
  name: string;
  url: string;
  history?: Array<{
    day: string;
    uses: string;
    accounts: string;
  }>;
}

export interface MastodonEmoji {
  shortcode: string;
  url: string;
  static_url: string;
  visible_in_picker: boolean;
  category?: string;
}

export interface MastodonCard {
  url: string;
  title: string;
  description: string;
  type: 'link' | 'photo' | 'video' | 'rich';
  author_name?: string;
  author_url?: string;
  provider_name?: string;
  provider_url?: string;
  html?: string;
  width?: number;
  height?: number;
  image?: string;
  embed_url?: string;
  blurhash?: string;
}

export interface MastodonPoll {
  id: string;
  expires_at?: string;
  expired: boolean;
  multiple: boolean;
  votes_count: number;
  voters_count?: number;
  voted?: boolean;
  own_votes?: number[];
  options: Array<{
    title: string;
    votes_count?: number;
  }>;
  emojis: MastodonEmoji[];
}

export interface MastodonInstance {
  uri: string;
  title: string;
  short_description: string;
  description: string;
  email: string;
  version: string;
  urls: {
    streaming_api: string;
  };
  stats: {
    user_count: number;
    status_count: number;
    domain_count: number;
  };
  thumbnail?: string;
  languages: string[];
  registrations: boolean;
  approval_required: boolean;
  invites_enabled: boolean;
  configuration: {
    statuses: {
      max_characters: number;
      max_media_attachments: number;
      characters_reserved_per_url: number;
    };
    media_attachments: {
      supported_mime_types: string[];
      image_size_limit: number;
      image_matrix_limit: number;
      video_size_limit: number;
      video_frame_rate_limit: number;
      video_matrix_limit: number;
    };
    polls: {
      max_options: number;
      max_characters_per_option: number;
      min_expiration: number;
      max_expiration: number;
    };
  };
  contact_account?: MastodonAccount;
  rules: Array<{
    id: string;
    text: string;
  }>;
}

export interface MastodonApplication {
  id: string;
  name: string;
  website?: string;
  redirect_uri: string;
  client_id: string;
  client_secret: string;
  vapid_key?: string;
}

export interface MastodonToken {
  access_token: string;
  token_type: string;
  scope: string;
  created_at: number;
}

export interface MastodonUploadResponse {
  id: string;
  type: 'image' | 'video' | 'gifv' | 'audio' | 'unknown';
  url: string;
  preview_url: string;
  remote_url?: string;
  text_url?: string;
  meta?: Record<string, unknown>;
  description?: string;
  blurhash?: string;
}

/**
 * Mastodon API error response
 */
export interface MastodonErrorResponse {
  error: string;
  error_description?: string;
}

/**
 * Mastodon rate limiting info
 */
export interface MastodonRateLimit {
  requestsPerFiveMinutes: number;
  mediaUploadsPerThirtyMinutes: number;
  statusDeletionsPerThirtyMinutes: number;
}

/**
 * Mastodon metadata structure
 */
export interface MastodonMetadata {
  account: MastodonAccount;
  instance: MastodonInstance;
  rateLimit: MastodonRateLimit;
  features: {
    maxCharacters: number;
    maxMediaAttachments: number;
    maxPollOptions: number;
    supportsScheduling: boolean;
    supportsPolls: boolean;
    supportsSensitiveContent: boolean;
  };
}

/**
 * Mastodon content limits and constraints
 */
export const MASTODON_LIMITS = {
  // Default limits (can vary by instance)
  defaultMaxCharacters: 500,
  maxMediaAttachments: 4,
  maxPollOptions: 4,
  maxPollCharactersPerOption: 50,
  minPollExpiration: 300, // 5 minutes
  maxPollExpiration: 2629746, // 1 month

  // Media limits (defaults)
  defaultImageSizeLimit: 10485760, // 10MB
  defaultVideoSizeLimit: 41943040, // 40MB

  // Rate limiting (defaults)
  rateLimit: {
    requestsPerFiveMinutes: 300,
    mediaUploadsPerThirtyMinutes: 30,
    statusDeletionsPerThirtyMinutes: 30,
  },

  // Supported media types
  supportedImageTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  supportedVideoTypes: ['video/mp4', 'video/webm', 'video/quicktime'],
  supportedAudioTypes: [
    'audio/mpeg',
    'audio/ogg',
    'audio/wav',
    'audio/flac',
    'audio/aac',
    'audio/m4a',
    'audio/3gpp',
  ],

  // Visibility options
  visibilityOptions: ['public', 'unlisted', 'private', 'direct'] as const,
} as const;

export type MastodonVisibility =
  (typeof MASTODON_LIMITS.visibilityOptions)[number];
