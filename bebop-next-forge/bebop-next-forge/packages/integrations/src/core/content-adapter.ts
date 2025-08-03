import type { DestinationType } from '@repo/database/types';
import type {
  AdaptationOptions,
  AdaptedContent,
  ContentAdapter,
  ContentInput,
  MediaAttachment,
  ValidationResult,
} from '../types/platform';

/**
 * Abstract base class for content adapters
 * Provides common content transformation utilities
 */
export abstract class BaseContentAdapter implements ContentAdapter {
  abstract readonly platform: DestinationType;

  // Abstract methods that must be implemented by platform-specific adapters
  abstract adaptContent(
    content: ContentInput,
    options: AdaptationOptions
  ): Promise<AdaptedContent>;
  abstract validateContent(content: AdaptedContent): ValidationResult;

  // Common utility methods
  extractSocialTeaser(content: ContentInput): string {
    // Use excerpt if available
    if (content.excerpt?.trim()) {
      return this.truncateText(content.excerpt, 280);
    }

    // Extract first paragraph from body
    const firstParagraph = this.extractFirstParagraph(content.body);
    return this.truncateText(firstParagraph, 280);
  }

  optimizeTags(tags: string[], platform: DestinationType): string[] {
    if (!tags?.length) return [];

    // Clean and normalize tags
    const cleanTags = tags
      .map((tag) => this.cleanTag(tag))
      .filter((tag) => tag.length > 0)
      .filter((tag, index, array) => array.indexOf(tag) === index); // Remove duplicates

    // Apply platform-specific limits
    const maxTags = this.getMaxTagsForPlatform(platform);
    return cleanTags.slice(0, maxTags);
  }

  async optimizeMedia(media: MediaAttachment[]): Promise<MediaAttachment[]> {
    // Base implementation - can be overridden by platform-specific adapters
    return media.map((item) => ({
      ...item,
      altText: item.altText || 'Image', // Ensure alt text exists
    }));
  }

  // Protected utility methods
  protected truncateText(
    text: string,
    maxLength: number,
    suffix = '...'
  ): string {
    if (text.length <= maxLength) return text;

    const truncated = text.slice(0, maxLength - suffix.length);
    const lastSpace = truncated.lastIndexOf(' ');

    // Try to break at word boundary
    if (lastSpace > maxLength * 0.8) {
      return truncated.slice(0, lastSpace) + suffix;
    }

    return truncated + suffix;
  }

  protected extractFirstParagraph(markdown: string): string {
    // Remove markdown headers
    const withoutHeaders = markdown.replace(/^#{1,6}\s+.+$/gm, '');

    // Split by double newlines (paragraph breaks)
    const paragraphs = withoutHeaders.split(/\n\s*\n/).filter((p) => p.trim());

    if (paragraphs.length === 0) return '';

    // Get first meaningful paragraph
    for (const paragraph of paragraphs) {
      const cleaned = this.stripMarkdown(paragraph.trim());
      if (cleaned.length > 50) {
        // Minimum meaningful length
        return cleaned;
      }
    }

    return this.stripMarkdown(paragraphs[0].trim());
  }

  protected stripMarkdown(text: string): string {
    return (
      text
        // Remove code blocks
        .replace(/```[\s\S]*?```/g, '')
        .replace(/`[^`]*`/g, '')
        // Remove links but keep text
        .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
        // Remove images
        .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
        // Remove bold/italic
        .replace(/\*\*([^*]*)\*\*/g, '$1')
        .replace(/\*([^*]*)\*/g, '$1')
        .replace(/__([^_]*)__/g, '$1')
        .replace(/_([^_]*)_/g, '$1')
        // Remove headers
        .replace(/^#{1,6}\s+/gm, '')
        // Clean up extra whitespace
        .replace(/\s+/g, ' ')
        .trim()
    );
  }

  protected cleanTag(tag: string): string {
    return tag
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '') // Remove special characters
      .replace(/^(.{30}).*/, '$1'); // Limit length
  }

  protected getMaxTagsForPlatform(platform: DestinationType): number {
    const limits: Record<string, number> = {
      HASHNODE: 5,
      DEVTO: 4,
      BLUESKY: 10, // No official limit, but reasonable
      MASTODON: 10, // No official limit, but reasonable
    };

    return limits[platform] || 5;
  }

  protected extractKeyPoints(content: string, maxPoints = 5): string[] {
    const points: string[] = [];

    // Look for bullet points
    const bulletMatches = content.match(/^[\s]*[-*+]\s+(.+)$/gm);
    if (bulletMatches) {
      points.push(
        ...bulletMatches.map((match) =>
          this.stripMarkdown(match.replace(/^[\s]*[-*+]\s+/, ''))
        )
      );
    }

    // Look for numbered lists
    const numberedMatches = content.match(/^[\s]*\d+\.\s+(.+)$/gm);
    if (numberedMatches) {
      points.push(
        ...numberedMatches.map((match) =>
          this.stripMarkdown(match.replace(/^[\s]*\d+\.\s+/, ''))
        )
      );
    }

    // If no lists found, extract sentences that look like key points
    if (points.length === 0) {
      const sentences = content
        .split(/[.!?]+/)
        .filter((s) => s.trim().length > 20);
      points.push(
        ...sentences
          .slice(0, maxPoints)
          .map((s) => this.stripMarkdown(s.trim()))
      );
    }

    return points.slice(0, maxPoints);
  }

  protected createThread(content: string, maxLength: number): string[] {
    const sentences = content.split(/(?<=[.!?])\s+/);
    const threads: string[] = [];
    let currentThread = '';

    for (const sentence of sentences) {
      const cleanSentence = sentence.trim();
      if (!cleanSentence) continue;

      // Check if adding this sentence would exceed the limit
      const potential = currentThread
        ? `${currentThread} ${cleanSentence}`
        : cleanSentence;

      if (potential.length <= maxLength) {
        currentThread = potential;
      } else {
        // Save current thread and start new one
        if (currentThread) {
          threads.push(currentThread);
        }
        currentThread = cleanSentence;

        // If single sentence is too long, truncate it
        if (currentThread.length > maxLength) {
          threads.push(this.truncateText(currentThread, maxLength));
          currentThread = '';
        }
      }
    }

    // Add the last thread
    if (currentThread) {
      threads.push(currentThread);
    }

    return threads;
  }
}
