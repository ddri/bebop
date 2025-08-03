import type { DestinationType } from '@repo/database/types';
import { BaseContentAdapter } from '../../core/content-adapter';
import { BlueskyContentSchema } from '../../types/content';
import type {
  AdaptationOptions,
  AdaptedContent,
  ContentInput,
  MediaAttachment,
  ValidationResult,
} from '../../types/platform';
import {
  extractFirstParagraph,
  extractImages,
  stripMarkdown,
} from '../../utils/markdown';
import { BLUESKY_LIMITS } from './types';

/**
 * Content adapter for Bluesky platform
 * Handles content transformation and optimization for Bluesky's AT Protocol requirements
 */
export class BlueskyAdapter extends BaseContentAdapter {
  readonly platform: DestinationType = 'BLUESKY';

  async adaptContent(
    content: ContentInput,
    options: AdaptationOptions
  ): Promise<AdaptedContent> {
    try {
      // For Bluesky, we combine title and body into a single text field
      const title = content.title;
      const body = this.preparePlainTextContent(content.body);

      // Create combined text (Bluesky doesn't have separate title/body)
      const combinedText = this.createBlueskyText(title, body);

      // Extract and process media (limit to 4 images)
      const media = await this.extractAndOptimizeMedia(content.body);

      // Build Bluesky-specific metadata
      const metadata = this.buildBlueskyMetadata(content, options);

      const adaptedContent: AdaptedContent = {
        title: '', // Bluesky doesn't use separate titles
        body: combinedText,
        excerpt: this.generateExcerpt(combinedText),
        tags: [], // Bluesky uses hashtags in text, not separate tags
        media,
        metadata,
      };

      return adaptedContent;
    } catch (error) {
      throw new Error(
        `Failed to adapt content for Bluesky: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  validateContent(content: AdaptedContent): ValidationResult {
    try {
      // Use Zod schema for validation
      BlueskyContentSchema.parse(content);

      const errors: string[] = [];
      const warnings: string[] = [];

      // Text length validations
      if (!content.body?.trim()) {
        errors.push('Post text is required');
      }

      if (content.body && content.body.length > BLUESKY_LIMITS.maxTextLength) {
        warnings.push(
          `Post is ${content.body.length} characters. Will be split into a thread.`
        );
      }

      // Media validations
      if (
        content.media &&
        content.media.length > BLUESKY_LIMITS.maxImagesPerPost
      ) {
        errors.push(
          `Maximum ${BLUESKY_LIMITS.maxImagesPerPost} images allowed per post`
        );
      }

      // Check for potential formatting issues
      if (content.body?.includes('```')) {
        warnings.push('Code blocks will be displayed as plain text on Bluesky');
      }

      if (content.body?.includes('![')) {
        warnings.push(
          'Markdown image syntax will be displayed as text. Use media attachments instead.'
        );
      }

      // Check for long paragraphs that might not display well
      if (content.body) {
        const paragraphs = content.body.split('\n\n');
        const longParagraphs = paragraphs.filter((p) => p.length > 200);
        if (longParagraphs.length > 0) {
          warnings.push(
            'Some paragraphs are very long. Consider breaking them up for better readability.'
          );
        }
      }

      return {
        valid: errors.length === 0,
        errors,
        warnings,
      };
    } catch (_error) {
      return {
        valid: false,
        errors: ['Content validation failed'],
        warnings: [],
      };
    }
  }

  // Bluesky-specific methods

  /**
   * Generate thread preview showing how content will be split
   */
  generateThreadPreview(
    content: ContentInput
  ): Array<{ text: string; characterCount: number }> {
    const combinedText = this.createBlueskyText(
      content.title,
      this.preparePlainTextContent(content.body)
    );

    if (combinedText.length <= BLUESKY_LIMITS.maxTextLength) {
      return [{ text: combinedText, characterCount: combinedText.length }];
    }

    return this.splitTextIntoThread(combinedText);
  }

  /**
   * Extract hashtags from content for Bluesky
   */
  extractHashtags(content: ContentInput): string[] {
    const fullText = `${content.title} ${content.body}`.toLowerCase();
    const hashtags: string[] = [];

    // Look for existing hashtags
    const hashtagMatches = fullText.match(/#[\w]+/g);
    if (hashtagMatches) {
      hashtags.push(...hashtagMatches);
    }

    // Extract potential hashtags from tags
    if (content.metadata?.tags) {
      const tags = content.metadata.tags as string[];
      tags.forEach((tag) => {
        const cleanTag = tag.toLowerCase().replace(/[^a-z0-9]/g, '');
        if (cleanTag) {
          hashtags.push(`#${cleanTag}`);
        }
      });
    }

    return [...new Set(hashtags)]; // Remove duplicates
  }

  /**
   * Extract mentions from content
   */
  extractMentions(content: ContentInput): string[] {
    const fullText = `${content.title} ${content.body}`;
    const mentions = fullText.match(/@[\w.-]+/g) || [];
    return [...new Set(mentions)];
  }

  /**
   * Generate social media friendly text for Bluesky
   */
  generateSocialText(
    content: ContentInput,
    maxLength: number = BLUESKY_LIMITS.maxTextLength
  ): string {
    let text = this.createBlueskyText(
      content.title,
      this.preparePlainTextContent(content.body)
    );

    if (text.length <= maxLength) {
      return text;
    }

    // Try to fit within limit while preserving meaning
    const excerpt = this.extractFirstParagraph(content.body);
    text = content.title ? `${content.title}\n\n${excerpt}` : excerpt;

    if (text.length <= maxLength) {
      return text;
    }

    // Truncate with ellipsis
    return `${this.truncateText(text, maxLength - 3)}...`;
  }

  /**
   * Suggest thread structure for long content
   */
  suggestThreadStructure(content: ContentInput): {
    shouldUseThread: boolean;
    estimatedPosts: number;
    structure: Array<{ section: string; length: number }>;
  } {
    const fullText = this.createBlueskyText(
      content.title,
      this.preparePlainTextContent(content.body)
    );

    if (fullText.length <= BLUESKY_LIMITS.maxTextLength) {
      return {
        shouldUseThread: false,
        estimatedPosts: 1,
        structure: [{ section: 'Complete post', length: fullText.length }],
      };
    }

    const threadPosts = this.splitTextIntoThread(fullText);

    return {
      shouldUseThread: true,
      estimatedPosts: threadPosts.length,
      structure: threadPosts.map((post, index) => ({
        section: `Post ${index + 1}`,
        length: post.characterCount,
      })),
    };
  }

  // Private helper methods

  private preparePlainTextContent(markdown: string): string {
    // Convert markdown to plain text suitable for Bluesky
    let text = stripMarkdown(markdown);

    // Clean up extra whitespace
    text = text.replace(/\n{3,}/g, '\n\n');
    text = text.replace(/\s+/g, ' ');

    // Convert markdown links to plain URLs
    text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1 $2');

    // Preserve intentional line breaks
    text = text.replace(/ {2}\n/g, '\n');

    return text.trim();
  }

  private createBlueskyText(title: string, body: string): string {
    if (!title) {
      return body;
    }
    if (!body) {
      return title;
    }

    // Combine title and body with appropriate spacing
    return `${title}\n\n${body}`;
  }

  private generateExcerpt(text: string): string {
    // Generate a short excerpt for preview purposes
    const firstParagraph = text.split('\n\n')[0];
    return this.truncateText(firstParagraph, 160);
  }

  private async extractAndOptimizeMedia(
    markdown: string
  ): Promise<MediaAttachment[]> {
    const images = extractImages(markdown);

    // Limit to Bluesky's maximum and add required alt text
    return images.slice(0, BLUESKY_LIMITS.maxImagesPerPost).map((img) => ({
      url: img.url,
      altText: img.alt || 'Image',
      type: 'image' as const,
    }));
  }

  private buildBlueskyMetadata(
    content: ContentInput,
    _options: AdaptationOptions
  ): Record<string, unknown> {
    const metadata: Record<string, unknown> = {};

    // Extract hashtags and mentions
    metadata.hashtags = this.extractHashtags(content);
    metadata.mentions = this.extractMentions(content);

    // Thread configuration
    if (content.metadata) {
      if (content.metadata.threadMode !== undefined) {
        metadata.threadMode = content.metadata.threadMode;
      }

      if (content.metadata.languages) {
        metadata.languages = content.metadata.languages;
      }
    }

    // Auto-detect if content should be threaded
    const threadStructure = this.suggestThreadStructure(content);
    metadata.suggestedThread = threadStructure;

    return metadata;
  }

  private splitTextIntoThread(
    text: string
  ): Array<{ text: string; characterCount: number }> {
    const posts: Array<{ text: string; characterCount: number }> = [];

    if (text.length <= BLUESKY_LIMITS.maxTextLength) {
      return [{ text, characterCount: text.length }];
    }

    // Split by paragraphs first
    const paragraphs = text.split('\n\n');
    let currentPost = '';

    for (const paragraph of paragraphs) {
      const potentialPost = currentPost
        ? `${currentPost}\n\n${paragraph}`
        : paragraph;

      if (potentialPost.length <= BLUESKY_LIMITS.maxTextLength) {
        currentPost = potentialPost;
      } else if (currentPost) {
        posts.push({ text: currentPost, characterCount: currentPost.length });
        currentPost = paragraph;
      } else {
        // Single paragraph is too long, split by sentences
        const sentences = paragraph.split('. ');
        let sentencePost = '';

        for (const sentence of sentences) {
          const potentialSentencePost = sentencePost
            ? `${sentencePost}. ${sentence}`
            : sentence;

          if (potentialSentencePost.length <= BLUESKY_LIMITS.maxTextLength) {
            sentencePost = potentialSentencePost;
          } else if (sentencePost) {
            posts.push({
              text: sentencePost,
              characterCount: sentencePost.length,
            });
            sentencePost = sentence;
          } else {
            // Even single sentence is too long, hard cut
            const truncated = `${sentence.substring(0, BLUESKY_LIMITS.maxTextLength - 3)}...`;
            posts.push({ text: truncated, characterCount: truncated.length });
          }
        }

        if (sentencePost) {
          currentPost = sentencePost;
        }
      }
    }

    if (currentPost) {
      posts.push({ text: currentPost, characterCount: currentPost.length });
    }

    return posts;
  }

  // Override the protected method from base class
  protected extractFirstParagraph(markdown: string): string {
    return extractFirstParagraph(markdown);
  }
}
