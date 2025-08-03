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
  MastodonCredentials,
  MastodonConfig,
  MastodonStatus,
  MastodonAccount,
  MastodonInstance,
  MastodonUploadResponse,
  MastodonMetadata,
} from './types';
import {
  MastodonCredentialsSchema,
  MastodonConfigSchema,
  MastodonStatusInputSchema,
  MASTODON_LIMITS,
} from './types';

/**
 * Mastodon API client for publishing and managing posts
 * Implements Mastodon REST API with direct HTTP calls
 */
export class MastodonClient extends BasePlatformClient {
  readonly platform: DestinationType = 'MASTODON';
  
  private accessToken?: string;
  private instanceUrl?: string;
  private instanceConfig?: MastodonInstance;

  constructor() {
    super();
  }

  async authenticate(credentials: PlatformCredentials): Promise<void> {
    try {
      // Validate credentials structure
      if (credentials.type !== 'bearer-token') {
        throw new AuthenticationError(this.platform, 'Mastodon requires bearer token authentication');
      }

      const parsedCredentials = MastodonCredentialsSchema.parse(credentials.data);
      this.accessToken = parsedCredentials.accessToken;
      this.instanceUrl = parsedCredentials.instanceUrl.replace(/\/$/, ''); // Remove trailing slash

      // Test authentication by fetching account info
      await this.validateToken();
      
      // Fetch instance configuration
      await this.loadInstanceConfig();
      
      this.credentials = credentials;
      this.isAuthenticated = true;
    } catch (error) {
      this.isAuthenticated = false;
      if (error instanceof ValidationError) {
        throw error;
      }
      throw new AuthenticationError(this.platform, 'Failed to authenticate with Mastodon instance');
    }
  }

  async validateCredentials(credentials: PlatformCredentials): Promise<ValidationResult> {
    try {
      if (credentials.type !== 'bearer-token') {
        return {
          valid: false,
          errors: ['Mastodon requires bearer token authentication'],
          warnings: [],
        };
      }

      MastodonCredentialsSchema.parse(credentials.data);
      
      // Test the token by making a simple API call
      const tempInstanceUrl = credentials.data.instanceUrl.replace(/\/$/, '');
      const response = await this.makeRequest(`${tempInstanceUrl}/api/v1/accounts/verify_credentials`, {
        headers: {
          'Authorization': `Bearer ${credentials.data.accessToken}`,
        },
      });
      
      if (!response.ok) {
        return {
          valid: false,
          errors: [`Authentication failed: ${response.status} ${response.statusText}`],
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
      const mastodonConfig = config ? MastodonConfigSchema.parse(config) : ({} as MastodonConfig);
      
      // Validate content
      const validation = this.validateContent(content);
      if (!validation.valid) {
        return this.createErrorResult(`Content validation failed: ${validation.errors.join(', ')}`);
      }

      // Prepare status data
      const statusText = this.constructStatusText(content);
      const mediaIds: string[] = [];

      // Handle media uploads
      if (content.media && content.media.length > 0) {
        for (const media of content.media.slice(0, this.getMaxMediaAttachments())) {
          if (media.type === 'image') {
            // Note: In a real implementation, you'd fetch the media data from media.url
            // For now, we'll skip this step as it requires additional media processing
            // const mediaId = await this.uploadMedia(mediaData, media.altText);
            // mediaIds.push(mediaId);
          }
        }
      }

      // Create status payload
      const statusData: {
        status: string;
        visibility: string;
        media_ids?: string[];
        sensitive?: boolean;
        spoiler_text?: string;
        language?: string;
        poll?: {
          options: string[];
          expires_in: number;
          multiple?: boolean;
          hide_totals?: boolean;
        };
        scheduled_at?: string;
      } = {
        status: statusText,
        visibility: mastodonConfig.visibility || 'public',
      };

      if (mediaIds.length > 0) {
        statusData.media_ids = mediaIds;
      }

      if (mastodonConfig.sensitive) {
        statusData.sensitive = true;
      }

      if (mastodonConfig.spoilerText) {
        statusData.spoiler_text = mastodonConfig.spoilerText;
        statusData.sensitive = true; // Automatically set when content warning is used
      }

      if (mastodonConfig.language) {
        statusData.language = mastodonConfig.language;
      }

      if (mastodonConfig.poll) {
        statusData.poll = {
          options: mastodonConfig.poll.options,
          expires_in: mastodonConfig.poll.expiresIn,
          multiple: mastodonConfig.poll.multiple,
          hide_totals: mastodonConfig.poll.hideTotals,
        };
      }

      if (mastodonConfig.scheduledAt) {
        statusData.scheduled_at = mastodonConfig.scheduledAt;
      }

      // Make API request
      const response = await this.makeRequest(`${this.instanceUrl}/api/v1/statuses`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(statusData),
      });

      const result = await this.parseJsonResponse<MastodonStatus>(response);

      return this.createSuccessResult(
        result.id,
        result.url,
        {
          status: result,
          visibility: result.visibility,
          instance: this.instanceUrl,
          scheduled: !!mastodonConfig.scheduledAt,
        }
      );
    } catch (error) {
      this.handleApiError(error, 'Publishing');
    }
  }

  async update(id: string, content: AdaptedContent, config?: PlatformConfig): Promise<PublishResult> {
    this.ensureAuthenticated();

    try {
      const mastodonConfig = config ? MastodonConfigSchema.parse(config) : ({} as MastodonConfig);

      // Validate content
      const validation = this.validateContent(content);
      if (!validation.valid) {
        return this.createErrorResult(`Content validation failed: ${validation.errors.join(', ')}`);
      }

      // Prepare update data (only some fields can be updated)
      const statusText = this.constructStatusText(content);
      const updateData: {
        status: string;
        sensitive?: boolean;
        spoiler_text?: string;
        language?: string;
      } = {
        status: statusText,
      };

      if (mastodonConfig.sensitive !== undefined) {
        updateData.sensitive = mastodonConfig.sensitive;
      }

      if (mastodonConfig.spoilerText !== undefined) {
        updateData.spoiler_text = mastodonConfig.spoilerText;
      }

      if (mastodonConfig.language) {
        updateData.language = mastodonConfig.language;
      }

      const response = await this.makeRequest(`${this.instanceUrl}/api/v1/statuses/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      const result = await this.parseJsonResponse<MastodonStatus>(response);

      return this.createSuccessResult(
        result.id,
        result.url,
        {
          status: result,
          visibility: result.visibility,
          instance: this.instanceUrl,
          updated: true,
        }
      );
    } catch (error) {
      this.handleApiError(error, 'Updating');
    }
  }

  async delete(id: string): Promise<PublishResult> {
    this.ensureAuthenticated();

    try {
      const response = await this.makeRequest(`${this.instanceUrl}/api/v1/statuses/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
        },
      });

      if (!response.ok) {
        return this.createErrorResult(`Failed to delete status: ${response.status} ${response.statusText}`);
      }

      return this.createSuccessResult(undefined, undefined, {
        deletedStatusId: id,
        instance: this.instanceUrl,
      });
    } catch (error) {
      this.handleApiError(error, 'Deleting');
    }
  }

  async getMetadata(): Promise<PlatformMetadata> {
    this.ensureAuthenticated();

    try {
      // Get account info
      const accountResponse = await this.makeRequest(`${this.instanceUrl}/api/v1/accounts/verify_credentials`, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
        },
      });

      const account = await this.parseJsonResponse<MastodonAccount>(accountResponse);

      // Get instance info if not already loaded
      if (!this.instanceConfig) {
        await this.loadInstanceConfig();
      }

      return {
        account,
        instance: this.instanceConfig!,
        rateLimit: MASTODON_LIMITS.rateLimit,
        features: {
          maxCharacters: this.instanceConfig!.configuration.statuses.max_characters,
          maxMediaAttachments: this.instanceConfig!.configuration.statuses.max_media_attachments,
          maxPollOptions: this.instanceConfig!.configuration.polls.max_options,
          supportsScheduling: true,
          supportsPolls: true,
          supportsSensitiveContent: true,
        },
      };
    } catch (error) {
      throw new Error(`Failed to get Mastodon metadata: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  validateContent(content: AdaptedContent): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Required fields
    const statusText = this.constructStatusText(content);
    if (!statusText.trim() && (!content.media || content.media.length === 0)) {
      errors.push('Status text or media attachments are required');
    }

    // Length validations
    const maxCharacters = this.getMaxCharacters();
    if (statusText.length > maxCharacters) {
      errors.push(`Status exceeds maximum length of ${maxCharacters} characters (current: ${statusText.length})`);
    }

    // Media validations
    const maxMediaAttachments = this.getMaxMediaAttachments();
    if (content.media && content.media.length > maxMediaAttachments) {
      errors.push(`Maximum ${maxMediaAttachments} media attachments allowed`);
    }

    // Warning for long posts
    if (statusText.length > maxCharacters * 0.8) {
      warnings.push('Status is approaching character limit');
    }

    // Check for potential formatting issues
    if (statusText.includes('```')) {
      warnings.push('Code blocks are not specially formatted on Mastodon');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  // Mastodon-specific methods

  async uploadMedia(mediaData: Buffer, description?: string, mimeType?: string): Promise<string> {
    this.ensureAuthenticated();

    try {
      const formData = new FormData();
      const blob = new Blob([mediaData], { type: mimeType });
      formData.append('file', blob);
      
      if (description) {
        formData.append('description', description);
      }

      const response = await this.makeRequest(`${this.instanceUrl}/api/v2/media`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
        },
        body: formData,
      });

      const result = await this.parseJsonResponse<MastodonUploadResponse>(response);
      return result.id;
    } catch (error) {
      throw new Error(`Failed to upload media: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getStatus(id: string): Promise<MastodonStatus> {
    this.ensureAuthenticated();

    try {
      const response = await this.makeRequest(`${this.instanceUrl}/api/v1/statuses/${id}`, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
        },
      });

      return await this.parseJsonResponse<MastodonStatus>(response);
    } catch (error) {
      throw new Error(`Failed to get status: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getAccountStatuses(accountId?: string, limit = 20): Promise<MastodonStatus[]> {
    this.ensureAuthenticated();

    try {
      const endpoint = accountId 
        ? `/api/v1/accounts/${accountId}/statuses`
        : '/api/v1/accounts/verify_credentials/statuses';

      const response = await this.makeRequest(`${this.instanceUrl}${endpoint}?limit=${limit}`, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
        },
      });

      return await this.parseJsonResponse<MastodonStatus[]>(response);
    } catch (error) {
      throw new Error(`Failed to get account statuses: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Private helper methods

  private async validateToken(): Promise<void> {
    if (!this.accessToken || !this.instanceUrl) {
      throw new AuthenticationError(this.platform, 'No access token or instance URL provided');
    }

    try {
      const response = await this.makeRequest(`${this.instanceUrl}/api/v1/accounts/verify_credentials`, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
        },
      });

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

  private async loadInstanceConfig(): Promise<void> {
    try {
      const response = await this.makeRequest(`${this.instanceUrl}/api/v2/instance`);
      this.instanceConfig = await this.parseJsonResponse<MastodonInstance>(response);
    } catch (error) {
      // Fallback to v1 instance endpoint if v2 is not available
      try {
        const response = await this.makeRequest(`${this.instanceUrl}/api/v1/instance`);
        this.instanceConfig = await this.parseJsonResponse<MastodonInstance>(response);
      } catch (fallbackError) {
        throw new Error(`Failed to load instance configuration: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  }

  private constructStatusText(content: AdaptedContent): string {
    let text = '';
    
    if (content.title && content.body) {
      text = `${content.title}\n\n${content.body}`;
    } else {
      text = content.title || content.body || '';
    }

    return text.trim();
  }

  private getMaxCharacters(): number {
    return this.instanceConfig?.configuration.statuses.max_characters || MASTODON_LIMITS.defaultMaxCharacters;
  }

  private getMaxMediaAttachments(): number {
    return this.instanceConfig?.configuration.statuses.max_media_attachments || MASTODON_LIMITS.maxMediaAttachments;
  }

  getInstanceUrl(): string | undefined {
    return this.instanceUrl;
  }

  getInstanceConfig(): MastodonInstance | undefined {
    return this.instanceConfig;
  }
}