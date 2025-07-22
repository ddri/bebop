import type { DestinationType } from '@repo/database/types';
import { BaseContentAdapter } from '../../core/content-adapter';
import type {
  ContentInput,
  AdaptedContent,
  AdaptationOptions,
  ValidationResult,
  MediaAttachment,
} from '../../types/platform';
import { MastodonContentSchema } from '../../types/content';
import { extractImages, extractFirstParagraph, stripMarkdown } from '../../utils/markdown';
import { MASTODON_LIMITS, type MastodonVisibility } from './types';

/**
 * Content adapter for Mastodon platform
 * Handles content transformation and optimization for Mastodon's requirements
 */
export class MastodonAdapter extends BaseContentAdapter {
  readonly platform: DestinationType = 'MASTODON';

  async adaptContent(content: ContentInput, options: AdaptationOptions): Promise<AdaptedContent> {
    try {
      // Extract basic content
      const title = content.title;
      const body = this.preparePlainTextContent(content.body);
      
      // Create status text (Mastodon combines title and body)
      const statusText = this.createStatusText(title, body);
      
      // Extract and process media (limit to instance maximum)
      const media = await this.extractAndOptimizeMedia(content.body);
      
      // Process hashtags
      const tags = this.extractHashtags(content);
      
      // Build Mastodon-specific metadata
      const metadata = this.buildMastodonMetadata(content, options);

      const adaptedContent: AdaptedContent = {
        title: '', // Mastodon doesn't use separate titles
        body: statusText,
        excerpt: this.generateExcerpt(statusText),
        tags,
        media,
        metadata,
      };

      return adaptedContent;
    } catch (error) {
      throw new Error(`Failed to adapt content for Mastodon: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  validateContent(content: AdaptedContent): ValidationResult {
    try {
      // Use Zod schema for validation
      MastodonContentSchema.parse(content);
      
      const errors: string[] = [];
      const warnings: string[] = [];

      // Text length validations
      if (!content.body?.trim() && (!content.media || content.media.length === 0)) {
        errors.push('Status text or media attachments are required');
      }

      if (content.body && content.body.length > MASTODON_LIMITS.defaultMaxCharacters) {
        errors.push(`Status exceeds default maximum length of ${MASTODON_LIMITS.defaultMaxCharacters} characters (current: ${content.body.length})`);
        warnings.push('Consider checking your instance\'s character limit as it may be higher');
      }

      // Media validations
      if (content.media && content.media.length > MASTODON_LIMITS.maxMediaAttachments) {
        errors.push(`Maximum ${MASTODON_LIMITS.maxMediaAttachments} media attachments allowed`);
      }

      // Content quality warnings
      if (content.body && content.body.length > MASTODON_LIMITS.defaultMaxCharacters * 0.8) {
        warnings.push('Status is approaching character limit');
      }

      // Check for potential formatting issues
      if (content.body && content.body.includes('```')) {
        warnings.push('Code blocks are not specially formatted on Mastodon');
      }

      if (content.body && content.body.includes('![')) {
        warnings.push('Markdown image syntax will be displayed as text. Use media attachments instead.');
      }

      // Hashtag validation
      if (content.tags && content.tags.length > 10) {
        warnings.push('Many hashtags may reduce post visibility. Consider using fewer, more targeted hashtags.');
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

  // Mastodon-specific methods

  /**
   * Generate content warning text suggestion
   */
  generateContentWarning(content: ContentInput): string | undefined {
    const text = `${content.title} ${content.body}`.toLowerCase();
    
    // Common content warning triggers
    const triggers = [
      { pattern: /politic|election|vote/i, warning: 'Politics' },
      { pattern: /death|dying|suicide/i, warning: 'Death mention' },
      { pattern: /mental health|depression|anxiety/i, warning: 'Mental health' },
      { pattern: /covid|pandemic|virus/i, warning: 'COVID/Health' },
      { pattern: /violence|assault|abuse/i, warning: 'Violence' },
      { pattern: /food|eating|diet/i, warning: 'Food' },
      { pattern: /alcohol|drink|drunk/i, warning: 'Alcohol' },
    ];

    for (const trigger of triggers) {
      if (trigger.pattern.test(text)) {
        return trigger.warning;
      }
    }

    return undefined;
  }

  /**
   * Suggest optimal visibility setting based on content
   */
  suggestVisibility(content: ContentInput): MastodonVisibility {
    const text = `${content.title} ${content.body}`.toLowerCase();
    
    // Personal/private indicators
    if (text.includes('personal') || text.includes('private') || text.includes('diary')) {
      return 'private';
    }
    
    // Direct message indicators
    if (text.includes('@') && text.split('@').length - 1 <= 2) {
      return 'direct';
    }
    
    // Unlisted indicators (personal but not private)
    if (text.includes('journal') || text.includes('thoughts') || text.includes('opinion')) {
      return 'unlisted';
    }
    
    // Default to public
    return 'public';
  }

  /**
   * Extract and format hashtags for Mastodon
   */
  extractHashtags(content: ContentInput): string[] {
    const fullText = `${content.title} ${content.body}`;
    const hashtags: string[] = [];

    // Extract existing hashtags
    const hashtagMatches = fullText.match(/#[\w]+/g);
    if (hashtagMatches) {
      hashtags.push(...hashtagMatches.map(tag => tag.toLowerCase()));
    }

    // Convert metadata tags to hashtags
    if (content.metadata?.tags) {
      const tags = content.metadata.tags as string[];
      tags.forEach(tag => {
        const cleanTag = this.cleanHashtag(tag);
        if (cleanTag && !hashtags.includes(cleanTag)) {
          hashtags.push(cleanTag);
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
    const mentions = fullText.match(/@[\w.-]+(@[\w.-]+\.\w+)?/g) || [];
    return [...new Set(mentions)];
  }

  /**
   * Generate poll suggestion from content
   */
  suggestPoll(content: ContentInput): { options: string[]; question: string } | undefined {
    const text = `${content.title} ${content.body}`;
    
    // Look for question patterns
    const questionPatterns = [
      /what do you think about (.+)\?/i,
      /which (.+) do you prefer\?/i,
      /should (.+)\?/i,
      /would you (.+)\?/i,
      /do you (.+)\?/i,
    ];

    for (const pattern of questionPatterns) {
      const match = pattern.exec(text);
      if (match) {
        return {
          question: match[0],
          options: ['Yes', 'No', 'Not sure'],
        };
      }
    }

    // Look for vs/versus patterns
    const vsPattern = /(.+)\s+(?:vs|versus)\s+(.+)/i;
    const vsMatch = vsPattern.exec(text);
    if (vsMatch) {
      return {
        question: `${vsMatch[1].trim()} vs ${vsMatch[2].trim()}?`,
        options: [vsMatch[1].trim(), vsMatch[2].trim()],
      };
    }

    return undefined;
  }

  /**
   * Optimize status text for Mastodon's character limit
   */
  optimizeForCharacterLimit(content: ContentInput, maxLength: number): string {
    let text = this.createStatusText(content.title, this.preparePlainTextContent(content.body));
    
    if (text.length <= maxLength) {
      return text;
    }

    // Try different truncation strategies
    
    // 1. Remove hashtags if present and try again
    const textWithoutHashtags = text.replace(/#[\w]+/g, '').trim();
    if (textWithoutHashtags.length <= maxLength) {
      return textWithoutHashtags + '\n\n' + this.extractHashtags(content).slice(0, 3).join(' ');
    }

    // 2. Truncate body but keep title
    if (content.title) {
      const titleWithBreak = `${content.title}\n\n`;
      const remainingLength = maxLength - titleWithBreak.length - 3; // 3 for "..."
      
      if (remainingLength > 50) {
        const truncatedBody = this.truncateText(this.preparePlainTextContent(content.body), remainingLength);
        return titleWithBreak + truncatedBody + '...';
      }
    }

    // 3. Hard truncate with ellipsis
    return this.truncateText(text, maxLength - 3) + '...';
  }

  // Private helper methods

  private preparePlainTextContent(markdown: string): string {
    // Convert markdown to plain text suitable for Mastodon
    let text = stripMarkdown(markdown);

    // Clean up extra whitespace
    text = text.replace(/\n{3,}/g, '\n\n');
    text = text.replace(/\s+/g, ' ');

    // Convert markdown links to plain format suitable for Mastodon
    text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1 $2');

    // Preserve intentional line breaks
    text = text.replace(/  \n/g, '\n');

    return text.trim();
  }

  private createStatusText(title: string, body: string): string {
    if (!title) return body;
    if (!body) return title;
    
    // Combine title and body with appropriate spacing
    return `${title}\n\n${body}`;
  }

  private generateExcerpt(text: string): string {
    // Generate a short excerpt for preview purposes
    const firstLine = text.split('\n')[0];
    return this.truncateText(firstLine, 100);
  }

  private async extractAndOptimizeMedia(markdown: string): Promise<MediaAttachment[]> {
    const images = extractImages(markdown);
    
    // Limit to Mastodon's maximum and add required alt text
    return images.slice(0, MASTODON_LIMITS.maxMediaAttachments).map(img => ({
      url: img.url,
      altText: img.alt || 'Image',
      type: 'image' as const,
    }));
  }

  private buildMastodonMetadata(content: ContentInput, options: AdaptationOptions): Record<string, unknown> {
    const metadata: Record<string, unknown> = {};

    // Extract hashtags and mentions
    metadata.hashtags = this.extractHashtags(content);
    metadata.mentions = this.extractMentions(content);

    // Visibility suggestion
    metadata.suggestedVisibility = this.suggestVisibility(content);

    // Content warning suggestion
    const contentWarning = this.generateContentWarning(content);
    if (contentWarning) {
      metadata.suggestedContentWarning = contentWarning;
    }

    // Poll suggestion
    const pollSuggestion = this.suggestPoll(content);
    if (pollSuggestion) {
      metadata.suggestedPoll = pollSuggestion;
    }

    // Extract from content metadata
    if (content.metadata) {
      if (content.metadata.visibility) {
        metadata.visibility = content.metadata.visibility;
      }

      if (content.metadata.sensitive !== undefined) {
        metadata.sensitive = content.metadata.sensitive;
      }

      if (content.metadata.spoilerText) {
        metadata.spoilerText = content.metadata.spoilerText;
      }

      if (content.metadata.language) {
        metadata.language = content.metadata.language;
      }

      if (content.metadata.scheduledAt) {
        metadata.scheduledAt = content.metadata.scheduledAt;
      }

      if (content.metadata.poll) {
        metadata.poll = content.metadata.poll;
      }
    }

    return metadata;
  }

  private cleanHashtag(tag: string): string {
    const cleaned = tag
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]/g, ''); // Remove all non-alphanumeric characters
    
    return cleaned ? `#${cleaned}` : '';
  }

  // Override the protected method from base class
  protected extractFirstParagraph(markdown: string): string {
    return extractFirstParagraph(markdown);
  }
}