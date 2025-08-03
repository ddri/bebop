import { z } from 'zod';

/**
 * Dev.to API endpoint
 */
export const DEVTO_API_ENDPOINT = 'https://dev.to/api';

/**
 * Dev.to authentication credentials schema
 */
export const DevtoCredentialsSchema = z.object({
  apiKey: z.string().min(1, 'API key is required'),
});

/**
 * Dev.to platform configuration schema
 */
export const DevtoConfigSchema = z
  .object({
    published: z.boolean().optional().default(false),
    series: z.string().optional(),
    main_image: z.string().url().optional(),
    canonical_url: z.string().url().optional(),
    description: z.string().optional(),
    organization_id: z.number().optional(),
  })
  .optional()
  .default({});

/**
 * Dev.to article input schema for API validation
 */
export const DevtoArticleInputSchema = z.object({
  title: z.string().min(1).max(255),
  body_markdown: z.string().min(1),
  published: z.boolean().optional().default(false),
  series: z.string().optional(),
  main_image: z.string().url().optional(),
  canonical_url: z.string().url().optional(),
  description: z.string().optional(),
  tags: z.array(z.string()).max(4).optional(),
  organization_id: z.number().optional(),
});

// Type definitions
export type DevtoCredentials = z.infer<typeof DevtoCredentialsSchema>;
export type DevtoConfig = z.infer<typeof DevtoConfigSchema>;
export type DevtoArticleInput = z.infer<typeof DevtoArticleInputSchema>;

/**
 * Dev.to API response structures
 */
export interface DevtoApiResponse<T = unknown> {
  data?: T;
  error?: string;
  errors?: string[];
}

export interface DevtoArticle {
  type_of: string;
  id: number;
  title: string;
  description: string;
  readable_publish_date: string;
  slug: string;
  path: string;
  url: string;
  comments_count: number;
  public_reactions_count: number;
  collection_id?: number;
  published_timestamp: string;
  positive_reactions_count: number;
  cover_image?: string;
  social_image: string;
  canonical_url?: string;
  created_at: string;
  edited_at?: string;
  crossposted_at?: string;
  published_at?: string;
  last_comment_at?: string;
  reading_time_minutes: number;
  tag_list: string[];
  tags: string;
  user: DevtoUser;
  organization?: DevtoOrganization;
  flare_tag?: {
    name: string;
    bg_color_hex: string;
    text_color_hex: string;
  };
}

export interface DevtoUser {
  name: string;
  username: string;
  twitter_username?: string;
  github_username?: string;
  user_id: number;
  website_url?: string;
  profile_image: string;
  profile_image_90: string;
}

export interface DevtoOrganization {
  name: string;
  username: string;
  slug: string;
  profile_image: string;
  profile_image_90: string;
}

export interface DevtoArticleRequest {
  article: {
    title: string;
    body_markdown: string;
    published?: boolean;
    series?: string;
    main_image?: string;
    canonical_url?: string;
    description?: string;
    tags?: string[];
    organization_id?: number;
  };
}

export interface DevtoArticleResponse extends DevtoApiResponse<DevtoArticle> {}
export interface DevtoUserResponse extends DevtoApiResponse<DevtoUser> {}

/**
 * Dev.to API error response
 */
export interface DevtoErrorResponse {
  error: string;
  status: number;
}

/**
 * Dev.to rate limiting info
 */
export interface DevtoRateLimit {
  callsPerHour: number;
  remainingCalls: number;
  resetTime: string;
}

/**
 * Dev.to metadata structure
 */
export interface DevtoMetadata {
  user: DevtoUser;
  organizations?: DevtoOrganization[];
  rateLimit: {
    callsPerHour: number;
    articlesPerDay: number;
  };
}
