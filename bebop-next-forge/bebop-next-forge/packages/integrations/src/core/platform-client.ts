import type { DestinationType } from '@repo/database/types';
import type {
  AdaptedContent,
  PlatformClient,
  PlatformConfig,
  PlatformCredentials,
  PlatformMetadata,
  PublishResult,
  ValidationResult,
} from '../types/platform';
import {
  AuthenticationError,
  PublishingError,
  ValidationError,
} from '../types/platform';

/**
 * Abstract base class for platform clients
 * Provides common functionality and enforces interface contracts
 */
export abstract class BasePlatformClient implements PlatformClient {
  abstract readonly platform: DestinationType;

  protected credentials?: PlatformCredentials;
  protected isAuthenticated = false;

  constructor() {}

  // Abstract methods that must be implemented by platform-specific clients
  abstract authenticate(credentials: PlatformCredentials): Promise<void>;
  abstract validateCredentials(
    credentials: PlatformCredentials
  ): Promise<ValidationResult>;
  abstract publish(
    content: AdaptedContent,
    config?: PlatformConfig
  ): Promise<PublishResult>;
  abstract update(
    id: string,
    content: AdaptedContent,
    config?: PlatformConfig
  ): Promise<PublishResult>;
  abstract delete(id: string): Promise<PublishResult>;
  abstract getMetadata(): Promise<PlatformMetadata>;
  abstract validateContent(content: AdaptedContent): ValidationResult;

  // Common utility methods
  protected ensureAuthenticated(): void {
    if (!this.isAuthenticated) {
      throw new AuthenticationError(this.platform, 'Client not authenticated');
    }
  }

  protected handleApiError(error: unknown, operation: string): never {
    if (error instanceof Error) {
      throw new PublishingError(
        this.platform,
        `${operation} failed: ${error.message}`,
        { originalError: error }
      );
    }
    throw new PublishingError(
      this.platform,
      `${operation} failed: Unknown error`
    );
  }

  protected validateRequiredFields(
    content: AdaptedContent,
    required: string[]
  ): void {
    const missing: string[] = [];

    for (const field of required) {
      if (field === 'title' && !content.title?.trim()) {
        missing.push('title');
      } else if (field === 'body' && !content.body?.trim()) {
        missing.push('body');
      } else if (
        field === 'tags' &&
        (!content.tags || content.tags.length === 0)
      ) {
        missing.push('tags');
      }
    }

    if (missing.length > 0) {
      throw new ValidationError(this.platform, [
        `Missing required fields: ${missing.join(', ')}`,
      ]);
    }
  }

  protected createSuccessResult(
    platformPostId?: string,
    platformUrl?: string,
    response?: Record<string, unknown>
  ): PublishResult {
    return {
      success: true,
      platformPostId,
      platformUrl,
      response,
    };
  }

  protected createErrorResult(
    error: string,
    response?: Record<string, unknown>
  ): PublishResult {
    return {
      success: false,
      error,
      response,
    };
  }

  // Helper method for making HTTP requests
  protected async makeRequest(
    url: string,
    options: RequestInit = {}
  ): Promise<Response> {
    const defaultHeaders = {
      'Content-Type': 'application/json',
      'User-Agent': 'Bebop-CMS/1.0',
    };

    const response = await fetch(url, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response;
  }

  // Helper method for handling JSON responses
  protected async parseJsonResponse<T = unknown>(
    response: Response
  ): Promise<T> {
    try {
      return (await response.json()) as T;
    } catch (error) {
      throw new Error('Failed to parse JSON response');
    }
  }

  // Helper method for validating content length
  protected validateContentLength(
    content: string,
    maxLength: number,
    fieldName = 'content'
  ): string[] {
    const errors: string[] = [];

    if (content.length > maxLength) {
      errors.push(
        `${fieldName} exceeds maximum length of ${maxLength} characters (current: ${content.length})`
      );
    }

    return errors;
  }

  // Helper method for validating array length
  protected validateArrayLength<T>(
    array: T[] | undefined,
    maxLength: number,
    fieldName: string
  ): string[] {
    const errors: string[] = [];

    if (array && array.length > maxLength) {
      errors.push(
        `${fieldName} exceeds maximum count of ${maxLength} (current: ${array.length})`
      );
    }

    return errors;
  }
}
