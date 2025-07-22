import type { DestinationType } from '@repo/database/types';
import { BasePlatformClient } from '../../core/platform-client';
import type {
  PlatformCredentials,
  PlatformConfig,
  PlatformMetadata,
  AdaptedContent,
  PublishResult,
  ValidationResult,
} from '../../types/platform';
import {
  AuthenticationError,
  ValidationError,
  PublishingError,
} from '../../types/platform';
import type {
  HashnodeCredentials,
  HashnodeConfig,
  HashnodeResponse,
  PublishPostResponse,
  UpdatePostResponse,
  RemovePostResponse,
  CreateSeriesResponse,
  UserResponse,
  PublicationResponse,
  PublicationSeriesResponse,
  HashnodePost,
  HashnodePublication,
  HashnodeSeries,
} from './types';
import {
  HashnodeCredentialsSchema,
  HashnodeConfigSchema,
  HashnodePostInputSchema,
  HASHNODE_API_ENDPOINT,
} from './types';
import {
  PUBLISH_POST_MUTATION,
  UPDATE_POST_MUTATION,
  REMOVE_POST_MUTATION,
  CREATE_SERIES_MUTATION,
  GET_USER_QUERY,
  GET_PUBLICATION_QUERY,
  GET_PUBLICATION_SERIES_QUERY,
  createPublishPostInput,
} from './queries';

/**
 * Hashnode API client for publishing and managing blog posts
 * Implements Hashnode API v2.0 with GraphQL
 */
export class HashnodeClient extends BasePlatformClient {
  readonly platform: DestinationType = 'HASHNODE';
  
  private accessToken?: string;
  private publicationId?: string;

  constructor() {
    super();
  }

  async authenticate(credentials: PlatformCredentials): Promise<void> {
    try {
      // Validate credentials structure
      if (credentials.type !== 'api-key') {
        throw new AuthenticationError(this.platform, 'Hashnode requires API key authentication');
      }

      const parsedCredentials = HashnodeCredentialsSchema.parse(credentials.data);
      this.accessToken = parsedCredentials.personalAccessToken;

      // Test authentication by fetching user info
      await this.validateToken();
      
      this.credentials = credentials;
      this.isAuthenticated = true;
    } catch (error) {
      this.isAuthenticated = false;
      if (error instanceof ValidationError) {
        throw error;
      }
      throw new AuthenticationError(this.platform, 'Failed to authenticate with Hashnode');
    }
  }

  async validateCredentials(credentials: PlatformCredentials): Promise<ValidationResult> {
    try {
      if (credentials.type !== 'api-key') {
        return {
          valid: false,
          errors: ['Hashnode requires API key authentication'],
          warnings: [],
        };
      }

      HashnodeCredentialsSchema.parse(credentials.data);
      
      // Test the token by making a simple API call
      const tempToken = credentials.data.personalAccessToken;
      const response = await this.makeGraphQLRequest(GET_USER_QUERY, { username: 'test' }, tempToken);
      
      if (response.errors) {
        return {
          valid: false,
          errors: response.errors.map(e => e.message),
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
        errors: [error instanceof Error ? error.message : 'Invalid credentials'],
        warnings: [],
      };
    }
  }

  async publish(content: AdaptedContent, config?: PlatformConfig): Promise<PublishResult> {
    this.ensureAuthenticated();

    try {
      // Validate and parse configuration
      const hashnodeConfig = config ? HashnodeConfigSchema.parse(config) : {};
      
      // Use publication ID from config or stored value
      const publicationId = hashnodeConfig.publicationId || this.publicationId;
      if (!publicationId) {
        return this.createErrorResult('Publication ID is required for publishing to Hashnode');
      }

      // Validate content
      const validation = this.validateContent(content);
      if (!validation.valid) {
        return this.createErrorResult(`Content validation failed: ${validation.errors.join(', ')}`);
      }

      // Create publish input
      const publishInput = createPublishPostInput({
        title: content.title!,
        subtitle: hashnodeConfig.subtitle,
        publicationId,
        contentMarkdown: content.body,
        tags: content.tags,
        coverImageUrl: hashnodeConfig.coverImageUrl,
        canonicalUrl: hashnodeConfig.canonicalUrl,
        seriesId: hashnodeConfig.seriesId,
        enableTableOfContents: hashnodeConfig.enableTableOfContents,
        isNewsletterActivated: hashnodeConfig.isNewsletterActivated,
        metaTitle: hashnodeConfig.metaTitle,
        metaDescription: hashnodeConfig.metaDescription,
        ogImageUrl: hashnodeConfig.ogImageUrl,
        publishAs: hashnodeConfig.publishAs,
        disableComments: hashnodeConfig.disableComments,
      });

      // Make API request
      const response = await this.makeGraphQLRequest<PublishPostResponse>(
        PUBLISH_POST_MUTATION,
        { input: publishInput }
      );

      if (response.errors) {
        return this.createErrorResult(
          `Hashnode API error: ${response.errors.map(e => e.message).join(', ')}`,
          response as Record<string, unknown>
        );
      }

      if (!response.data?.publishPost?.post) {
        return this.createErrorResult('No post data returned from Hashnode', response as Record<string, unknown>);
      }

      const post = response.data.publishPost.post;
      return this.createSuccessResult(post.id, post.url, {
        post,
        publication: post.publication,
        series: post.series,
      });
    } catch (error) {
      this.handleApiError(error, 'Publishing');
    }
  }

  async update(id: string, content: AdaptedContent, config?: PlatformConfig): Promise<PublishResult> {
    this.ensureAuthenticated();

    try {
      const hashnodeConfig = config ? HashnodeConfigSchema.parse(config) : {};

      // Validate content
      const validation = this.validateContent(content);
      if (!validation.valid) {
        return this.createErrorResult(`Content validation failed: ${validation.errors.join(', ')}`);
      }

      // Create update input
      const updateInput: any = {
        id,
        title: content.title,
        contentMarkdown: content.body,
      };

      // Add optional fields
      if (hashnodeConfig.subtitle) updateInput.subtitle = hashnodeConfig.subtitle;
      if (content.tags) updateInput.tags = content.tags.map(tag => ({ slug: tag.toLowerCase().replace(/[^a-z0-9]/g, ''), name: tag }));
      if (hashnodeConfig.coverImageUrl) updateInput.coverImageOptions = { coverImageURL: hashnodeConfig.coverImageUrl };
      if (hashnodeConfig.canonicalUrl) updateInput.originalArticleURL = hashnodeConfig.canonicalUrl;
      if (hashnodeConfig.seriesId) updateInput.seriesId = hashnodeConfig.seriesId;
      if (hashnodeConfig.disableComments !== undefined) updateInput.disableComments = hashnodeConfig.disableComments;

      // Settings
      if (hashnodeConfig.enableTableOfContents !== undefined || hashnodeConfig.isNewsletterActivated !== undefined) {
        updateInput.settings = {};
        if (hashnodeConfig.enableTableOfContents !== undefined) updateInput.settings.enableTableOfContents = hashnodeConfig.enableTableOfContents;
        if (hashnodeConfig.isNewsletterActivated !== undefined) updateInput.settings.isNewsletterActivated = hashnodeConfig.isNewsletterActivated;
      }

      // Meta tags
      if (hashnodeConfig.metaTitle || hashnodeConfig.metaDescription || hashnodeConfig.ogImageUrl) {
        updateInput.metaTags = {};
        if (hashnodeConfig.metaTitle) updateInput.metaTags.title = hashnodeConfig.metaTitle;
        if (hashnodeConfig.metaDescription) updateInput.metaTags.description = hashnodeConfig.metaDescription;
        if (hashnodeConfig.ogImageUrl) updateInput.metaTags.image = hashnodeConfig.ogImageUrl;
      }

      const response = await this.makeGraphQLRequest<UpdatePostResponse>(
        UPDATE_POST_MUTATION,
        { input: updateInput }
      );

      if (response.errors) {
        return this.createErrorResult(
          `Hashnode API error: ${response.errors.map(e => e.message).join(', ')}`,
          response as Record<string, unknown>
        );
      }

      if (!response.data?.updatePost?.post) {
        return this.createErrorResult('No post data returned from Hashnode', response as Record<string, unknown>);
      }

      const post = response.data.updatePost.post;
      return this.createSuccessResult(post.id, post.url, {
        post,
        publication: post.publication,
        series: post.series,
      });
    } catch (error) {
      this.handleApiError(error, 'Updating');
    }
  }

  async delete(id: string): Promise<PublishResult> {
    this.ensureAuthenticated();

    try {
      const response = await this.makeGraphQLRequest<RemovePostResponse>(
        REMOVE_POST_MUTATION,
        { input: { id } }
      );

      if (response.errors) {
        return this.createErrorResult(
          `Hashnode API error: ${response.errors.map(e => e.message).join(', ')}`,
          response as Record<string, unknown>
        );
      }

      return this.createSuccessResult(undefined, undefined, {
        deletedPostId: id,
      });
    } catch (error) {
      this.handleApiError(error, 'Deleting');
    }
  }

  async getMetadata(): Promise<PlatformMetadata> {
    this.ensureAuthenticated();

    try {
      // Get user info to find publications
      const userResponse = await this.makeGraphQLRequest<UserResponse>(
        GET_USER_QUERY,
        { username: 'me' } // Hashnode uses 'me' for current user
      );

      if (userResponse.errors || !userResponse.data?.user) {
        throw new Error('Failed to fetch user metadata');
      }

      const user = userResponse.data.user;
      const publications = user.publications.edges.map(edge => edge.node);

      return {
        user: {
          id: user.id,
          name: user.name,
          username: user.username,
          profilePicture: user.profilePicture,
          socialMediaLinks: user.socialMediaLinks,
        },
        publications,
        rateLimit: {
          queriesPerMinute: 20000,
          mutationsPerMinute: 500,
        },
      };
    } catch (error) {
      throw new Error(`Failed to get Hashnode metadata: ${error instanceof Error ? error.message : 'Unknown error'}`);
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

    // Tag validations
    if (content.tags && content.tags.length > 5) {
      errors.push('Maximum 5 tags allowed');
    }

    // Tag format warnings
    if (content.tags) {
      content.tags.forEach(tag => {
        if (tag.length > 30) {
          warnings.push(`Tag "${tag}" is longer than 30 characters`);
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
  }

  // Hashnode-specific methods
  async getPublications(): Promise<HashnodePublication[]> {
    this.ensureAuthenticated();

    const metadata = await this.getMetadata();
    return (metadata.publications as HashnodePublication[]) || [];
  }

  async getPublicationSeries(publicationId: string): Promise<HashnodeSeries[]> {
    this.ensureAuthenticated();

    try {
      const response = await this.makeGraphQLRequest<PublicationSeriesResponse>(
        GET_PUBLICATION_SERIES_QUERY,
        { publicationId, first: 50 }
      );

      if (response.errors || !response.data?.publication?.series) {
        return [];
      }

      return response.data.publication.series.edges.map((edge: any) => edge.node);
    } catch (error) {
      throw new Error(`Failed to get publication series: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async createSeries(name: string, publicationId: string, description?: string, coverImage?: string): Promise<HashnodeSeries> {
    this.ensureAuthenticated();

    try {
      const response = await this.makeGraphQLRequest<CreateSeriesResponse>(
        CREATE_SERIES_MUTATION,
        {
          input: {
            name,
            publicationId,
            description,
            coverImage,
          },
        }
      );

      if (response.errors) {
        throw new Error(`Hashnode API error: ${response.errors.map(e => e.message).join(', ')}`);
      }

      if (!response.data?.createSeries?.series) {
        throw new Error('No series data returned from Hashnode');
      }

      return response.data.createSeries.series;
    } catch (error) {
      throw new Error(`Failed to create series: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  setPublicationId(publicationId: string): void {
    this.publicationId = publicationId;
  }

  // Private helper methods
  private async validateToken(): Promise<void> {
    if (!this.accessToken) {
      throw new AuthenticationError(this.platform, 'No access token provided');
    }

    try {
      const response = await this.makeGraphQLRequest(
        GET_USER_QUERY,
        { username: 'me' }
      );

      if (response.errors) {
        throw new AuthenticationError(
          this.platform,
          `Token validation failed: ${response.errors.map(e => e.message).join(', ')}`
        );
      }
    } catch (error) {
      if (error instanceof AuthenticationError) {
        throw error;
      }
      throw new AuthenticationError(this.platform, 'Token validation failed');
    }
  }

  private async makeGraphQLRequest<T = unknown>(
    query: string,
    variables: Record<string, unknown> = {},
    customToken?: string
  ): Promise<HashnodeResponse<T>> {
    const token = customToken || this.accessToken;
    
    if (!token) {
      throw new AuthenticationError(this.platform, 'No access token available');
    }

    const response = await this.makeRequest(HASHNODE_API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        variables,
      }),
    });

    return await this.parseJsonResponse<HashnodeResponse<T>>(response);
  }
}