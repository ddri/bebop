import type { DestinationType } from '@repo/database/types';
import { BaseContentAdapter } from '../../core/content-adapter';
import type {
  ContentInput,
  AdaptedContent,
  AdaptationOptions,
  ValidationResult,
  MediaAttachment,
} from '../../types/platform';
import { DevToContentSchema } from '../../types/content';
import { extractTableOfContents, extractImages, extractFirstParagraph, stripMarkdown } from '../../utils/markdown';

/**
 * Content adapter for Dev.to platform
 * Handles content transformation and optimization for Dev.to's requirements
 */
export class DevtoAdapter extends BaseContentAdapter {
  readonly platform: DestinationType = 'DEVTO';

  async adaptContent(content: ContentInput, options: AdaptationOptions): Promise<AdaptedContent> {
    try {
      // Extract basic content
      const title = content.title;
      const body = this.prepareMarkdownContent(content.body);
      const excerpt = content.excerpt || this.extractFirstParagraph(content.body);
      
      // Process tags (Dev.to allows max 4 tags)
      const tags = this.optimizeTags(content.metadata?.tags as string[] || [], this.platform);
      
      // Extract and process media
      const media = await this.extractAndOptimizeMedia(content.body);
      
      // Build Dev.to-specific metadata
      const metadata = this.buildDevtoMetadata(content, options);

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
      throw new Error(`Failed to adapt content for Dev.to: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  validateContent(content: AdaptedContent): ValidationResult {
    try {
      // Use Zod schema for validation
      DevToContentSchema.parse(content);
      
      const errors: string[] = [];
      const warnings: string[] = [];

      // Additional business logic validations
      if (content.title && content.title.length > 255) {
        errors.push('Title must be 255 characters or less');
      }

      if (content.tags && content.tags.length > 4) {
        errors.push('Dev.to allows maximum 4 tags');
      }

      // Check for potential SEO issues
      if (content.title && content.title.length < 10) {
        warnings.push('Title is very short, consider making it more descriptive');
      }

      if (content.excerpt && content.excerpt.length > 160) {
        warnings.push('Excerpt is longer than typical meta description length (160 chars)');
      }

      // Dev.to specific validations
      if (content.body && content.body.length > 100000) {
        warnings.push('Article is very long (>100k characters). Consider breaking it into a series.');
      }

      // Check for markdown issues
      if (content.body.includes('```') && !content.body.includes('```\n')) {
        warnings.push('Code blocks might not render correctly - ensure proper markdown formatting');
      }

      // Tag format warnings
      if (content.tags) {
        content.tags.forEach(tag => {
          if (tag.length > 30) {
            warnings.push(`Tag "${tag}" is longer than 30 characters and may be truncated`);
          }
          if (!/^[a-zA-Z0-9\s-]+$/.test(tag)) {
            warnings.push(`Tag "${tag}" contains special characters that may be modified`);
          }
        });
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

  // Dev.to-specific methods

  /**
   * Generate SEO-optimized excerpt for Dev.to
   */
  generateSEOExcerpt(content: ContentInput): string {
    const excerpt = content.excerpt || this.extractFirstParagraph(content.body);
    return this.truncateText(excerpt, 160); // Optimal meta description length
  }

  /**
   * Extract cover image from content or generate one based on content
   */
  extractCoverImage(content: ContentInput): string | undefined {
    const images = extractImages(content.body);
    return images.length > 0 ? images[0].url : undefined;
  }

  /**
   * Generate social media teaser optimized for Dev.to sharing
   */
  generateSocialTeaser(content: ContentInput): string {
    const title = content.title;
    const excerpt = this.extractFirstParagraph(content.body);
    
    // Create a compelling teaser combining title and excerpt
    const teaser = `${title}\n\n${this.truncateText(excerpt, 200)}`;
    
    return this.truncateText(teaser, 280); // Twitter-friendly length
  }

  /**
   * Optimize tags specifically for Dev.to
   */
  optimizeDevtoTags(tags: string[]): string[] {
    return tags
      .slice(0, 4) // Dev.to limit
      .map(tag => this.cleanDevtoTag(tag))
      .filter(tag => tag.length > 0);
  }

  /**
   * Suggest related tags based on content for Dev.to
   */
  suggestTags(content: ContentInput): string[] {
    const body = stripMarkdown(content.body).toLowerCase();
    const suggestions: string[] = [];

    // Technology tags popular on Dev.to
    const techKeywords = {
      javascript: ['javascript', 'js', 'react', 'node', 'npm'],
      typescript: ['typescript', 'ts'],
      python: ['python', 'django', 'flask', 'fastapi'],
      react: ['react', 'jsx', 'component', 'hooks'],
      nodejs: ['node.js', 'nodejs', 'npm', 'express'],
      webdev: ['html', 'css', 'frontend', 'backend', 'fullstack'],
      tutorial: ['how to', 'guide', 'tutorial', 'learn'],
      beginners: ['beginner', 'basic', 'introduction', 'getting started'],
      career: ['career', 'job', 'interview', 'advice'],
      productivity: ['productivity', 'tools', 'workflow', 'tips'],
      opensource: ['open source', 'github', 'contribution'],
      devops: ['docker', 'kubernetes', 'ci/cd', 'deployment'],
      database: ['sql', 'mongodb', 'postgres', 'database'],
      mobile: ['mobile', 'android', 'ios', 'flutter', 'react native'],
      ai: ['ai', 'machine learning', 'ml', 'artificial intelligence'],
    };

    Object.entries(techKeywords).forEach(([tag, keywords]) => {
      if (keywords.some(keyword => body.includes(keyword))) {
        suggestions.push(tag);
      }
    });

    return suggestions.slice(0, 3); // Return top 3 suggestions
  }

  /**
   * Generate series name suggestion based on content
   */
  suggestSeriesName(content: ContentInput): string | undefined {
    const title = content.title.toLowerCase();
    const body = stripMarkdown(content.body).toLowerCase();

    // Look for series indicators
    const seriesPatterns = [
      /part\s+(\d+)/i,
      /episode\s+(\d+)/i,
      /chapter\s+(\d+)/i,
      /(beginner|intermediate|advanced)\s+(guide|tutorial)/i,
      /(\w+)\s+tutorial\s+series/i,
      /learning\s+(\w+)/i,
    ];

    for (const pattern of seriesPatterns) {
      const match = title.match(pattern) || body.match(pattern);
      if (match) {
        // Extract potential series name
        if (match[1] && isNaN(Number(match[1]))) {
          return `${match[1]} Tutorial Series`;
        }
        // If it's a numbered part, suggest a generic series name
        return `${content.title.split(' ')[0]} Series`;
      }
    }

    return undefined;
  }

  // Private helper methods

  private prepareMarkdownContent(markdown: string): string {
    // Clean up markdown for Dev.to
    let cleaned = markdown;

    // Ensure proper spacing around headers
    cleaned = cleaned.replace(/^(#{1,6})\s*(.+)$/gm, '$1 $2');

    // Ensure proper spacing around code blocks
    cleaned = cleaned.replace(/```/g, '\n```\n');

    // Clean up excessive newlines
    cleaned = cleaned.replace(/\n{3,}/g, '\n\n');

    // Ensure proper list formatting
    cleaned = cleaned.replace(/^(\s*[-*+])\s*/gm, '$1 ');

    // Convert HTML comments to markdown comments for Dev.to
    cleaned = cleaned.replace(/<!--\s*(.*?)\s*-->/g, '<!-- $1 -->');

    // Ensure proper callout formatting (Dev.to supports {% callout %} syntax)
    cleaned = cleaned.replace(/^\s*>\s*\*\*(Note|Warning|Tip|Info):\*\*\s*(.*)/gm, 
      '{% callout %}\n**$1:** $2\n{% endcallout %}');

    return cleaned.trim();
  }

  private async extractAndOptimizeMedia(markdown: string): Promise<MediaAttachment[]> {
    const images = extractImages(markdown);
    
    return images.map(img => ({
      url: img.url,
      altText: img.alt || 'Image',
      type: 'image' as const,
    }));
  }

  private buildDevtoMetadata(content: ContentInput, options: AdaptationOptions): Record<string, unknown> {
    const metadata: Record<string, unknown> = {};

    // Extract metadata from content metadata
    if (content.metadata) {
      // Publication settings
      if (content.metadata.published !== undefined) {
        metadata.published = content.metadata.published;
      }

      // Series settings
      if (content.metadata.series) {
        metadata.series = content.metadata.series;
      }

      // Cover image
      if (content.metadata.main_image) {
        metadata.main_image = content.metadata.main_image;
      }

      // Canonical URL
      if (content.metadata.canonical_url) {
        metadata.canonical_url = content.metadata.canonical_url;
      }

      // Description (excerpt)
      if (content.metadata.description) {
        metadata.description = content.metadata.description;
      }

      // Organization ID
      if (content.metadata.organization_id) {
        metadata.organization_id = content.metadata.organization_id;
      }
    }

    // Auto-generate missing data
    if (!metadata.description) {
      metadata.description = this.generateSEOExcerpt(content);
    }

    // Auto-extract cover image if not provided
    if (!metadata.main_image) {
      const extractedCover = this.extractCoverImage(content);
      if (extractedCover) {
        metadata.main_image = extractedCover;
      }
    }

    // Default to draft unless explicitly published
    if (metadata.published === undefined) {
      metadata.published = false;
    }

    // Auto-suggest series name if content looks like part of a series
    if (!metadata.series) {
      const suggestedSeries = this.suggestSeriesName(content);
      if (suggestedSeries) {
        metadata.suggestedSeries = suggestedSeries;
      }
    }

    return metadata;
  }

  private cleanDevtoTag(tag: string): string {
    return tag
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special chars except spaces and hyphens
      .replace(/\s+/g, '') // Remove spaces (Dev.to tags don't have spaces)
      .replace(/^(.{30}).*/, '$1'); // Limit length to 30 chars
  }

  // Override the protected method from base class
  protected extractFirstParagraph(markdown: string): string {
    return extractFirstParagraph(markdown);
  }
}