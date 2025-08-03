import type { DestinationType } from '@repo/database/types';
import { BasePlatformClient } from '../../core/platform-client';
import type {
  AdaptedContent,
  PlatformConfig,
  PlatformCredentials,
  PlatformMetadata,
  PublishResult,
  ValidationResult,
} from '../../types/platform';
import { AuthenticationError, ValidationError } from '../../types/platform';
import type {
  DevtoArticle,
  DevtoArticleRequest,
  DevtoConfig,
  DevtoUser,
} from './types';
import {
  DEVTO_API_ENDPOINT,
  DevtoConfigSchema,
  DevtoCredentialsSchema,
} from './types';

/**
 * Dev.to API client for publishing and managing blog posts
 * Implements Dev.to API v1 (Forem API)
 */
export class DevtoClient extends BasePlatformClient {
  readonly platform: DestinationType = 'DEVTO';

  private apiKey?: string;

  constructor() {
    super();
  }

  async authenticate(credentials: PlatformCredentials): Promise<void> {
    try {
      // Validate credentials structure
      if (credentials.type !== 'api-key') {
        throw new AuthenticationError(
          this.platform,
          'Dev.to requires API key authentication'
        );
      }

      const parsedCredentials = DevtoCredentialsSchema.parse(credentials.data);
      this.apiKey = parsedCredentials.apiKey;

      // Test authentication by fetching user info
      await this.validateToken();

      this.credentials = credentials;
      this.isAuthenticated = true;
    } catch (error) {
      this.isAuthenticated = false;
      if (error instanceof ValidationError) {
        throw error;
      }
      throw new AuthenticationError(
        this.platform,
        'Failed to authenticate with Dev.to'
      );
    }
  }

  async validateCredentials(
    credentials: PlatformCredentials
  ): Promise<ValidationResult> {
    try {
      if (credentials.type !== 'api-key') {
        return {
          valid: false,
          errors: ['Dev.to requires API key authentication'],
          warnings: [],
        };
      }

      DevtoCredentialsSchema.parse(credentials.data);

      // Test the API key by making a simple API call
      const tempApiKey = credentials.data.apiKey;
      const response = await this.makeRequest(
        `${DEVTO_API_ENDPOINT}/users/me`,
        {
          headers: {
            'api-key': tempApiKey,
          },
        }
      );

      if (!response.ok) {
        return {
          valid: false,
          errors: [
            `API request failed: ${response.status} ${response.statusText}`,
          ],
          warnings: [],
        };
      }

      return {
        valid: true,
        errors: [],
        warnings: [],
      };
    } catch (error) {
      return {
        valid: false,
        errors: [
          error instanceof Error ? error.message : 'Invalid credentials',
        ],
        warnings: [],
      };
    }
  }

  async publish(
    content: AdaptedContent,
    config?: PlatformConfig
  ): Promise<PublishResult> {
    this.ensureAuthenticated();

    try {
      // Validate and parse configuration
      const devtoConfig = config
        ? DevtoConfigSchema.parse(config)
        : ({} as DevtoConfig);

      // Validate content
      const validation = this.validateContent(content);
      if (!validation.valid) {
        return this.createErrorResult(
          `Content validation failed: ${validation.errors.join(', ')}`
        );
      }

      // Create article payload
      const articleData: DevtoArticleRequest = {
        article: {
          title: content.title!,
          body_markdown: content.body!,
          published: devtoConfig.published || false,
          series: devtoConfig.series,
          main_image: devtoConfig.main_image,
          canonical_url: devtoConfig.canonical_url,
          description: devtoConfig.description,
          tags: content.tags?.slice(0, 4), // Dev.to allows max 4 tags
          organization_id: devtoConfig.organization_id,
        },
      };

      // Make API request
      const response = await this.makeRequest(
        `${DEVTO_API_ENDPOINT}/articles`,
        {
          method: 'POST',
          headers: {
            'api-key': this.apiKey!,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(articleData),
        }
      );

      const result = await this.parseJsonResponse<DevtoArticle>(response);

      return this.createSuccessResult(result.id.toString(), result.url, {
        article: result,
        published: result.published_at ? true : false,
        slug: result.slug,
      });
    } catch (error) {
      this.handleApiError(error, 'Publishing');
    }
  }

  async update(
    id: string,
    content: AdaptedContent,
    config?: PlatformConfig
  ): Promise<PublishResult> {
    this.ensureAuthenticated();

    try {
      const devtoConfig = config
        ? DevtoConfigSchema.parse(config)
        : ({} as DevtoConfig);

      // Validate content
      const validation = this.validateContent(content);
      if (!validation.valid) {
        return this.createErrorResult(
          `Content validation failed: ${validation.errors.join(', ')}`
        );
      }

      // Create update payload
      const articleData: DevtoArticleRequest = {
        article: {
          title: content.title!,
          body_markdown: content.body!,
          published: devtoConfig.published,
          series: devtoConfig.series,
          main_image: devtoConfig.main_image,
          canonical_url: devtoConfig.canonical_url,
          description: devtoConfig.description,
          tags: content.tags?.slice(0, 4),
          organization_id: devtoConfig.organization_id,
        },
      };

      const response = await this.makeRequest(
        `${DEVTO_API_ENDPOINT}/articles/${id}`,
        {
          method: 'PUT',
          headers: {
            'api-key': this.apiKey!,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(articleData),
        }
      );

      const result = await this.parseJsonResponse<DevtoArticle>(response);

      return this.createSuccessResult(result.id.toString(), result.url, {
        article: result,
        published: result.published_at ? true : false,
        slug: result.slug,
      });
    } catch (error) {
      this.handleApiError(error, 'Updating');
    }
  }

  async delete(id: string): Promise<PublishResult> {
    this.ensureAuthenticated();

    try {
      // Note: Dev.to API doesn't support deleting articles via API
      // This is a limitation of the platform
      return this.createErrorResult(
        'Dev.to does not support deleting articles via API. Please delete manually from the Dev.to dashboard.',
        { articleId: id, deletionSupported: false }
      );
    } catch (error) {
      this.handleApiError(error, 'Deleting');
    }
  }

  async getMetadata(): Promise<PlatformMetadata> {
    this.ensureAuthenticated();

    try {
      // Get user info
      const userResponse = await this.makeRequest(
        `${DEVTO_API_ENDPOINT}/users/me`,
        {
          headers: {
            'api-key': this.apiKey!,
          },
        }
      );

      const user = await this.parseJsonResponse<DevtoUser>(userResponse);

      return {
        user: {
          id: user.user_id.toString(),
          name: user.name,
          username: user.username,
          profilePicture: user.profile_image,
          website: user.website_url,
          twitter: user.twitter_username,
          github: user.github_username,
        },
        rateLimit: {
          articlesPerDay: 10, // Dev.to rate limit
          callsPerHour: 1000, // Estimated based on Dev.to's fair use policy
        },
      };
    } catch (error) {
      throw new Error(
        `Failed to get Dev.to metadata: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  validateContent(content: AdaptedContent): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Required fields
    if (!content.title?.trim()) {
      errors.push('Title is required');
    }

    if (!content.body?.trim()) {
      errors.push('Content body is required');
    }

    // Length validations
    if (content.title && content.title.length > 255) {
      errors.push('Title must be 255 characters or less');
    }

    // Body length recommendation (Dev.to doesn't have strict limits but this is practical)
    if (content.body && content.body.length > 100000) {
      warnings.push(
        'Article is very long (>100k characters). Consider breaking it into a series.'
      );
    }

    // Tag validations
    if (content.tags && content.tags.length > 4) {
      errors.push('Maximum 4 tags allowed on Dev.to');
    }

    // Tag format warnings
    if (content.tags) {
      content.tags.forEach((tag) => {
        if (tag.length > 30) {
          warnings.push(
            `Tag "${tag}" is longer than 30 characters and may be truncated`
          );
        }
        if (!/^[a-zA-Z0-9\s-]+$/.test(tag)) {
          warnings.push(
            `Tag "${tag}" contains special characters that may be modified`
          );
        }
      });
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  // Dev.to-specific methods
  async getMyArticles(page = 1, perPage = 30): Promise<DevtoArticle[]> {
    this.ensureAuthenticated();

    try {
      const response = await this.makeRequest(
        `${DEVTO_API_ENDPOINT}/articles/me?page=${page}&per_page=${perPage}`,
        {
          headers: {
            'api-key': this.apiKey!,
          },
        }
      );

      return await this.parseJsonResponse<DevtoArticle[]>(response);
    } catch (error) {
      throw new Error(
        `Failed to get articles: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async getArticle(id: string): Promise<DevtoArticle> {
    this.ensureAuthenticated();

    try {
      const response = await this.makeRequest(
        `${DEVTO_API_ENDPOINT}/articles/${id}`,
        {
          headers: {
            'api-key': this.apiKey!,
          },
        }
      );

      return await this.parseJsonResponse<DevtoArticle>(response);
    } catch (error) {
      throw new Error(
        `Failed to get article: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async getPublishedArticles(
    username?: string,
    page = 1,
    perPage = 30
  ): Promise<DevtoArticle[]> {
    try {
      const url = username
        ? `${DEVTO_API_ENDPOINT}/articles?username=${username}&page=${page}&per_page=${perPage}`
        : `${DEVTO_API_ENDPOINT}/articles/me/published?page=${page}&per_page=${perPage}`;

      const headers: Record<string, string> = {};
      if (!username && this.apiKey) {
        headers['api-key'] = this.apiKey;
      }

      const response = await this.makeRequest(url, { headers });
      return await this.parseJsonResponse<DevtoArticle[]>(response);
    } catch (error) {
      throw new Error(
        `Failed to get published articles: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  // Private helper methods
  private async validateToken(): Promise<void> {
    if (!this.apiKey) {
      throw new AuthenticationError(this.platform, 'No API key provided');
    }

    try {
      const response = await this.makeRequest(
        `${DEVTO_API_ENDPOINT}/users/me`,
        {
          headers: {
            'api-key': this.apiKey,
          },
        }
      );

      if (!response.ok) {
        throw new AuthenticationError(
          this.platform,
          `Token validation failed: ${response.status} ${response.statusText}`
        );
      }
    } catch (error) {
      if (error instanceof AuthenticationError) {
        throw error;
      }
      throw new AuthenticationError(this.platform, 'Token validation failed');
    }
  }
}
