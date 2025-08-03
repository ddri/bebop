import { z } from 'zod';

// Hashnode API v2.0 Types

export interface HashnodeCredentials {
  personalAccessToken: string;
}

export interface HashnodeConfig {
  publicationId?: string;
  seriesId?: string;
  coverImageUrl?: string;
  subtitle?: string;
  canonicalUrl?: string;
  enableTableOfContents?: boolean;
  isNewsletterActivated?: boolean;
  metaTitle?: string;
  metaDescription?: string;
  ogImageUrl?: string;
  publishAs?: string; // user ID to publish as (for team publications)
  disableComments?: boolean;
}

// GraphQL Response Types
export interface HashnodePost {
  id: string;
  title: string;
  url: string;
  slug: string;
  content: {
    markdown: string;
    html: string;
  };
  coverImage?: {
    url: string;
    attribution?: string;
  };
  tags: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
  series?: {
    id: string;
    name: string;
    slug: string;
  };
  publication?: {
    id: string;
    title: string;
    displayTitle: string;
    url: string;
  };
  seo?: {
    title?: string;
    description?: string;
  };
  ogMetaData?: {
    image?: string;
  };
  publishedAt: string;
  updatedAt: string;
}

export interface HashnodePublication {
  id: string;
  title: string;
  displayTitle: string;
  url: string;
  about?: {
    markdown: string;
    html: string;
  };
  author: {
    id: string;
    name: string;
    username: string;
  };
  favicon?: string;
  headerColor?: string;
  metaTags?: string;
  preferences: {
    logo?: string;
    darkMode?: {
      enabled: boolean;
    };
    navbarItems: Array<{
      id: string;
      type: string;
      label: string;
      url?: string;
    }>;
  };
}

export interface HashnodeSeries {
  id: string;
  name: string;
  slug: string;
  description?: {
    markdown: string;
    html: string;
  };
  coverImage?: string;
  posts: {
    totalDocuments: number;
  };
  createdAt: string;
}

export interface HashnodeUser {
  id: string;
  name: string;
  username: string;
  profilePicture?: string;
  socialMediaLinks?: {
    website?: string;
    github?: string;
    twitter?: string;
    linkedin?: string;
  };
  publications: {
    edges: Array<{
      node: HashnodePublication;
    }>;
  };
}

// GraphQL Mutation Inputs
export interface PublishPostInput {
  title: string;
  subtitle?: string;
  publicationId: string;
  contentMarkdown: string;
  coverImageOptions?: {
    coverImageURL?: string;
    attribution?: string;
    photographer?: string;
  };
  tags: Array<{
    slug: string;
    name: string;
  }>;
  settings?: {
    enableTableOfContents?: boolean;
    isNewsletterActivated?: boolean;
    delisted?: boolean;
    pinnedToPinboardOnPublication?: boolean;
  };
  metaTags?: {
    title?: string;
    description?: string;
    image?: string;
  };
  originalArticleURL?: string; // canonical URL
  seriesId?: string;
  publishAs?: string;
  disableComments?: boolean;
}

export interface UpdatePostInput {
  id: string;
  title?: string;
  subtitle?: string;
  contentMarkdown?: string;
  coverImageOptions?: {
    coverImageURL?: string;
    attribution?: string;
    photographer?: string;
  };
  tags?: Array<{
    slug: string;
    name: string;
  }>;
  settings?: {
    enableTableOfContents?: boolean;
    isNewsletterActivated?: boolean;
    delisted?: boolean;
    pinnedToPinboardOnPublication?: boolean;
  };
  metaTags?: {
    title?: string;
    description?: string;
    image?: string;
  };
  originalArticleURL?: string;
  seriesId?: string;
  disableComments?: boolean;
}

export interface CreateSeriesInput {
  name: string;
  publicationId: string;
  description?: string;
  coverImage?: string;
}

// API Response Types
export interface HashnodeResponse<T = unknown> {
  data?: T;
  errors?: Array<{
    message: string;
    extensions?: {
      code: string;
    };
  }>;
}

export interface PublishPostResponse {
  publishPost: {
    post: HashnodePost;
  };
}

export interface UpdatePostResponse {
  updatePost: {
    post: HashnodePost;
  };
}

export interface RemovePostResponse {
  removePost: {
    post: {
      id: string;
    };
  };
}

export interface CreateSeriesResponse {
  createSeries: {
    series: HashnodeSeries;
  };
}

export interface UserResponse {
  user: HashnodeUser;
}

export interface PublicationResponse {
  publication: HashnodePublication;
}

export interface PublicationSeriesResponse {
  publication: {
    series: {
      edges: Array<{
        node: HashnodeSeries;
      }>;
    };
  };
}

// Validation Schemas
export const HashnodeCredentialsSchema = z.object({
  personalAccessToken: z.string().min(1, 'Personal Access Token is required'),
});

export const HashnodeConfigSchema = z.object({
  publicationId: z.string().optional(),
  seriesId: z.string().optional(),
  coverImageUrl: z.string().url().optional(),
  subtitle: z.string().optional(),
  canonicalUrl: z.string().url().optional(),
  enableTableOfContents: z.boolean().optional(),
  isNewsletterActivated: z.boolean().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  ogImageUrl: z.string().url().optional(),
  publishAs: z.string().optional(),
  disableComments: z.boolean().optional(),
});

export const HashnodePostInputSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255, 'Title too long'),
  subtitle: z.string().max(255, 'Subtitle too long').optional(),
  contentMarkdown: z.string().min(1, 'Content is required'),
  tags: z.array(z.string()).max(5, 'Maximum 5 tags allowed').optional(),
  publicationId: z.string().min(1, 'Publication ID is required'),
  seriesId: z.string().optional(),
  coverImageUrl: z.string().url().optional(),
  canonicalUrl: z.string().url().optional(),
  enableTableOfContents: z.boolean().optional(),
  isNewsletterActivated: z.boolean().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  ogImageUrl: z.string().url().optional(),
  publishAs: z.string().optional(),
  disableComments: z.boolean().optional(),
});

// Constants
export const HASHNODE_API_ENDPOINT = 'https://gql.hashnode.com';
export const HASHNODE_RATE_LIMITS = {
  QUERIES_PER_MINUTE: 20000,
  MUTATIONS_PER_MINUTE: 500,
} as const;
