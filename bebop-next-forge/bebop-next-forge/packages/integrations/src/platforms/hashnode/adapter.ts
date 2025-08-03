import type { DestinationType } from '@repo/database/types';
import { BaseContentAdapter } from '../../core/content-adapter';
import { HashnodeContentSchema } from '../../types/content';
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
  extractTableOfContents,
  stripMarkdown,
} from '../../utils/markdown';

/**
 * Content adapter for Hashnode platform
 * Handles content transformation and optimization for Hashnode's requirements
 */
export class HashnodeAdapter extends BaseContentAdapter {
  readonly platform: DestinationType = 'HASHNODE';

  async adaptContent(
    content: ContentInput,
    options: AdaptationOptions
  ): Promise<AdaptedContent> {
    try {
      // Extract basic content
      const title = content.title;
      const body = this.prepareMarkdownContent(content.body);
      const excerpt =
        content.excerpt || this.extractFirstParagraph(content.body);

      // Process tags
      const tags = this.optimizeTags(
        (content.metadata?.tags as string[]) || [],
        this.platform
      );

      // Extract and process media
      const media = await this.extractAndOptimizeMedia(content.body);

      // Build Hashnode-specific metadata
      const metadata = this.buildHashnodeMetadata(content, options);

      const adaptedContent: AdaptedContent = {
        title,
        body,
        excerpt,
        tags,
        media,
        metadata,
      };

      return adaptedContent;
    } catch (error) {
      throw new Error(
        `Failed to adapt content for Hashnode: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  validateContent(content: AdaptedContent): ValidationResult {
    try {
      // Use Zod schema for validation
      HashnodeContentSchema.parse(content);

      const errors: string[] = [];
      const warnings: string[] = [];

      // Additional business logic validations
      if (content.title && content.title.length > 255) {
        errors.push('Title must be 255 characters or less');
      }

      if (content.tags && content.tags.length > 5) {
        errors.push('Hashnode allows maximum 5 tags');
      }

      // Check for potential SEO issues
      if (content.title && content.title.length < 10) {
        warnings.push(
          'Title is very short, consider making it more descriptive'
        );
      }

      if (content.excerpt && content.excerpt.length > 160) {
        warnings.push(
          'Excerpt is longer than typical meta description length (160 chars)'
        );
      }

      // Check for markdown issues
      if (content.body.includes('```') && !content.body.includes('```\n')) {
        warnings.push(
          'Code blocks might not render correctly - ensure proper markdown formatting'
        );
      }

      return {
        valid: errors.length === 0,
        errors,
        warnings,
      };
    } catch (error) {
      return {
        valid: false,
        errors: ['Content validation failed'],
        warnings: [],
      };
    }
  }

  // Hashnode-specific methods

  /**
   * Generate SEO-optimized excerpt for Hashnode
   */
  generateSEOExcerpt(content: ContentInput): string {
    const excerpt = content.excerpt || this.extractFirstParagraph(content.body);
    return this.truncateText(excerpt, 160); // Optimal meta description length
  }

  /**
   * Generate table of contents if enabled
   */
  generateTableOfContents(
    markdown: string
  ): Array<{ level: number; text: string; slug: string }> {
    return extractTableOfContents(markdown);
  }

  /**
   * Extract cover image from content
   */
  extractCoverImage(content: ContentInput): string | undefined {
    const images = extractImages(content.body);
    return images.length > 0 ? images[0].url : undefined;
  }

  /**
   * Generate social media teaser optimized for Hashnode sharing
   */
  generateSocialTeaser(content: ContentInput): string {
    const title = content.title;
    const excerpt = this.extractFirstParagraph(content.body);

    // Create a compelling teaser combining title and excerpt
    const teaser = `${title}\n\n${this.truncateText(excerpt, 200)}`;

    return this.truncateText(teaser, 280); // Twitter-friendly length
  }

  /**
   * Optimize tags specifically for Hashnode
   */
  optimizeHashnodeTags(tags: string[]): string[] {
    return tags
      .slice(0, 5) // Hashnode limit
      .map((tag) => this.cleanHashnodeTag(tag))
      .filter((tag) => tag.length > 0);
  }

  /**
   * Suggest related tags based on content
   */
  suggestTags(content: ContentInput): string[] {
    const body = stripMarkdown(content.body).toLowerCase();
    const suggestions: string[] = [];

    // Technology tags
    const techKeywords = {
      javascript: ['javascript', 'js', 'react', 'node', 'npm'],
      typescript: ['typescript', 'ts'],
      python: ['python', 'django', 'flask'],
      react: ['react', 'jsx', 'component'],
      nodejs: ['node.js', 'nodejs', 'npm', 'express'],
      webdev: ['html', 'css', 'frontend', 'backend'],
      tutorial: ['how to', 'guide', 'tutorial', 'learn'],
      beginners: ['beginner', 'basic', 'introduction', 'getting started'],
    };

    Object.entries(techKeywords).forEach(([tag, keywords]) => {
      if (keywords.some((keyword) => body.includes(keyword))) {
        suggestions.push(tag);
      }
    });

    return suggestions.slice(0, 3); // Return top 3 suggestions
  }

  // Private helper methods

  private prepareMarkdownContent(markdown: string): string {
    // Clean up markdown for Hashnode
    let cleaned = markdown;

    // Ensure proper spacing around headers
    cleaned = cleaned.replace(/^(#{1,6})\s*(.+)$/gm, '$1 $2');

    // Ensure proper spacing around code blocks
    cleaned = cleaned.replace(/```/g, '\n```\n');

    // Clean up excessive newlines
    cleaned = cleaned.replace(/\n{3,}/g, '\n\n');

    // Ensure proper list formatting
    cleaned = cleaned.replace(/^(\s*[-*+])\s*/gm, '$1 ');

    return cleaned.trim();
  }

  private async extractAndOptimizeMedia(
    markdown: string
  ): Promise<MediaAttachment[]> {
    const images = extractImages(markdown);

    return images.map((img) => ({
      url: img.url,
      altText: img.alt || 'Image',
      type: 'image' as const,
    }));
  }

  private buildHashnodeMetadata(
    content: ContentInput,
    options: AdaptationOptions
  ): Record<string, unknown> {
    const metadata: Record<string, unknown> = {};

    // Extract metadata from content metadata
    if (content.metadata) {
      // Publication settings
      if (content.metadata.publicationId) {
        metadata.publicationId = content.metadata.publicationId;
      }

      // Series settings
      if (content.metadata.seriesId) {
        metadata.seriesId = content.metadata.seriesId;
      }

      // Cover image
      if (content.metadata.coverImage) {
        metadata.coverImage = content.metadata.coverImage;
      }

      // SEO settings
      if (content.metadata.metaTitle) {
        metadata.metaTitle = content.metadata.metaTitle;
      }

      if (content.metadata.metaDescription) {
        metadata.metaDescription = content.metadata.metaDescription;
      }

      // Canonical URL
      if (content.metadata.canonicalUrl) {
        metadata.canonicalUrl = content.metadata.canonicalUrl;
      }

      // Feature flags
      if (content.metadata.enableTableOfContents !== undefined) {
        metadata.enableTableOfContents = content.metadata.enableTableOfContents;
      }

      if (content.metadata.isNewsletterActivated !== undefined) {
        metadata.isNewsletterActivated = content.metadata.isNewsletterActivated;
      }

      if (content.metadata.disableComments !== undefined) {
        metadata.disableComments = content.metadata.disableComments;
      }
    }

    // Auto-generate missing SEO data
    if (!metadata.metaDescription) {
      metadata.metaDescription = this.generateSEOExcerpt(content);
    }

    // Auto-extract cover image if not provided
    if (!metadata.coverImage) {
      const extractedCover = this.extractCoverImage(content);
      if (extractedCover) {
        metadata.coverImage = extractedCover;
      }
    }

    // Auto-enable table of contents for long content
    if (metadata.enableTableOfContents === undefined) {
      const toc = this.generateTableOfContents(content.body);
      metadata.enableTableOfContents = toc.length >= 3; // Enable if 3+ headers
    }

    return metadata;
  }

  private cleanHashnodeTag(tag: string): string {
    return tag
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special chars except spaces and hyphens
      .replace(/\s+/g, '') // Remove spaces (Hashnode tags don't have spaces)
      .replace(/^(.{30}).*/, '$1'); // Limit length to 30 chars
  }

  // Override the protected method from base class
  protected extractFirstParagraph(markdown: string): string {
    return extractFirstParagraph(markdown);
  }
}
