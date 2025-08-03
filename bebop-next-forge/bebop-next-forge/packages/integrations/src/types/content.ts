import { z } from 'zod';

// Validation schemas for different content types
export const BaseContentSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  body: z.string().min(1, 'Content body is required'),
  excerpt: z.string().optional(),
  tags: z.array(z.string()).optional(),
  metadata: z.record(z.unknown()).optional(),
});

export const MediaAttachmentSchema = z.object({
  url: z.string().url('Invalid media URL'),
  altText: z.string().optional(),
  caption: z.string().optional(),
  type: z.enum(['image', 'video', 'audio', 'document']),
});

export const AdaptedContentSchema = BaseContentSchema.extend({
  media: z.array(MediaAttachmentSchema).optional(),
});

// Platform-specific content validation schemas
export const HashnodeContentSchema = AdaptedContentSchema.extend({
  metadata: z
    .object({
      publicationId: z.string().optional(),
      seriesId: z.string().optional(),
      coverImage: z.string().url().optional(),
      subtitle: z.string().optional(),
      canonicalUrl: z.string().url().optional(),
      enableTableOfContents: z.boolean().optional(),
      isNewsletterActivated: z.boolean().optional(),
      metaTitle: z.string().optional(),
      metaDescription: z.string().optional(),
      ogImage: z.string().url().optional(),
    })
    .optional(),
  tags: z.array(z.string()).max(5, 'Hashnode allows maximum 5 tags').optional(),
});

export const DevToContentSchema = AdaptedContentSchema.extend({
  metadata: z
    .object({
      published: z.boolean().optional(),
      series: z.string().optional(),
      canonicalUrl: z.string().url().optional(),
      description: z.string().optional(),
      coverImage: z.string().url().optional(),
      organizationId: z.number().optional(),
      mainImage: z.string().url().optional(),
    })
    .optional(),
  tags: z.array(z.string()).max(4, 'Dev.to allows maximum 4 tags').optional(),
});

export const BlueskyContentSchema = z.object({
  text: z.string().max(300, 'Bluesky posts are limited to 300 characters'),
  embed: z
    .object({
      uri: z.string().url().optional(),
      title: z.string().optional(),
      description: z.string().optional(),
      thumb: z.string().url().optional(),
      images: z
        .array(
          z.object({
            alt: z.string(),
            image: z.any(), // Blob type
          })
        )
        .max(4, 'Maximum 4 images allowed')
        .optional(),
    })
    .optional(),
  thread: z
    .array(
      z.object({
        text: z.string().max(300),
        embed: z.any().optional(),
      })
    )
    .optional(),
});

export const MastodonContentSchema = z.object({
  status: z.string().max(500, 'Default Mastodon limit is 500 characters'),
  instanceUrl: z.string().url('Valid instance URL required'),
  mediaIds: z
    .array(z.string())
    .max(4, 'Maximum 4 media attachments')
    .optional(),
  mediaAttributes: z
    .array(
      z.object({
        id: z.string(),
        description: z.string(),
        focus: z.string().optional(),
      })
    )
    .optional(),
  visibility: z
    .enum(['public', 'unlisted', 'private', 'direct'])
    .default('public'),
  sensitive: z.boolean().optional(),
  spoilerText: z.string().optional(),
  language: z.string().optional(),
  poll: z
    .object({
      options: z.array(z.string()).min(2).max(4),
      expiresIn: z.number(),
      multiple: z.boolean().optional(),
    })
    .optional(),
  inReplyToId: z.string().optional(),
});

// Content type mappings
export type BaseContent = z.infer<typeof BaseContentSchema>;
export type MediaAttachment = z.infer<typeof MediaAttachmentSchema>;
export type AdaptedContent = z.infer<typeof AdaptedContentSchema>;
export type HashnodeContent = z.infer<typeof HashnodeContentSchema>;
export type DevToContent = z.infer<typeof DevToContentSchema>;
export type BlueskyContent = z.infer<typeof BlueskyContentSchema>;
export type MastodonContent = z.infer<typeof MastodonContentSchema>;

// Content adaptation utilities
export const ContentLimits = {
  HASHNODE: {
    title: 255,
    tags: 5,
    body: Number.POSITIVE_INFINITY, // No specific limit
  },
  DEVTO: {
    title: 255,
    tags: 4,
    body: Number.POSITIVE_INFINITY, // No specific limit
  },
  BLUESKY: {
    text: 300,
    images: 4,
    threadLength: 25, // Reasonable limit
  },
  MASTODON: {
    status: 500, // Default, can vary by instance
    media: 4,
    pollOptions: 4,
  },
} as const;
