import type { DestinationType } from '@repo/database/types';
import type {
  AdaptationOptions,
  ContentAdapter,
  ContentInput,
  PlatformClient,
  PlatformConfig,
  PlatformCredentials,
  PublishResult,
} from '../types/platform';

/**
 * Publishing orchestrator that coordinates content adaptation and publishing
 */
export class Publisher {
  private clients: Map<DestinationType, PlatformClient> = new Map();
  private adapters: Map<DestinationType, ContentAdapter> = new Map();

  constructor() {}

  // Register platform clients and adapters
  registerClient(platform: DestinationType, client: PlatformClient): void {
    this.clients.set(platform, client);
  }

  registerAdapter(platform: DestinationType, adapter: ContentAdapter): void {
    this.adapters.set(platform, adapter);
  }

  // Authenticate a platform client
  async authenticatePlatform(
    platform: DestinationType,
    credentials: PlatformCredentials
  ): Promise<void> {
    const client = this.getClient(platform);
    await client.authenticate(credentials);
  }

  // Publish content to a specific platform
  async publishToplatform(
    platform: DestinationType,
    content: ContentInput,
    adaptationOptions: AdaptationOptions,
    platformConfig?: PlatformConfig
  ): Promise<PublishResult> {
    const client = this.getClient(platform);
    const adapter = this.getAdapter(platform);

    try {
      // Adapt content for the platform
      const adaptedContent = await adapter.adaptContent(
        content,
        adaptationOptions
      );

      // Validate adapted content
      const validation = adapter.validateContent(adaptedContent);
      if (!validation.valid) {
        return {
          success: false,
          error: `Content validation failed: ${validation.errors.join(', ')}`,
        };
      }

      // Publish to platform
      const result = await client.publish(adaptedContent, platformConfig);
      return result;
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Unknown publishing error',
      };
    }
  }

  // Update existing content on a platform
  async updateOnPlatform(
    platform: DestinationType,
    postId: string,
    content: ContentInput,
    adaptationOptions: AdaptationOptions,
    platformConfig?: PlatformConfig
  ): Promise<PublishResult> {
    const client = this.getClient(platform);
    const adapter = this.getAdapter(platform);

    try {
      const adaptedContent = await adapter.adaptContent(
        content,
        adaptationOptions
      );
      const validation = adapter.validateContent(adaptedContent);

      if (!validation.valid) {
        return {
          success: false,
          error: `Content validation failed: ${validation.errors.join(', ')}`,
        };
      }

      const result = await client.update(
        postId,
        adaptedContent,
        platformConfig
      );
      return result;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown update error',
      };
    }
  }

  // Delete content from a platform
  async deleteFromPlatform(
    platform: DestinationType,
    postId: string
  ): Promise<PublishResult> {
    const client = this.getClient(platform);

    try {
      const result = await client.delete(postId);
      return result;
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Unknown deletion error',
      };
    }
  }

  // Generate social teaser for content
  async generateSocialTeaser(
    platform: DestinationType,
    content: ContentInput
  ): Promise<string> {
    const adapter = this.getAdapter(platform);
    return adapter.extractSocialTeaser(content);
  }

  // Validate content for a platform without publishing
  async validateForPlatform(
    platform: DestinationType,
    content: ContentInput,
    adaptationOptions: AdaptationOptions
  ): Promise<{ valid: boolean; errors: string[]; warnings: string[] }> {
    const adapter = this.getAdapter(platform);

    try {
      const adaptedContent = await adapter.adaptContent(
        content,
        adaptationOptions
      );
      return adapter.validateContent(adaptedContent);
    } catch (error) {
      return {
        valid: false,
        errors: [error instanceof Error ? error.message : 'Adaptation failed'],
        warnings: [],
      };
    }
  }

  // Get available platforms
  getAvailablePlatforms(): DestinationType[] {
    return Array.from(this.clients.keys());
  }

  // Check if platform is supported
  isPlatformSupported(platform: DestinationType): boolean {
    return this.clients.has(platform) && this.adapters.has(platform);
  }

  // Get platform metadata
  async getPlatformMetadata(
    platform: DestinationType
  ): Promise<Record<string, unknown>> {
    const client = this.getClient(platform);
    return await client.getMetadata();
  }

  // Batch publishing to multiple platforms
  async publishToMultiplePlatforms(
    platforms: Array<{
      platform: DestinationType;
      adaptationOptions: AdaptationOptions;
      platformConfig?: PlatformConfig;
    }>,
    content: ContentInput
  ): Promise<Record<string, PublishResult>> {
    const results: Record<string, PublishResult> = {};

    // Publish to all platforms in parallel
    const promises = platforms.map(
      async ({ platform, adaptationOptions, platformConfig }) => {
        const result = await this.publishToplatform(
          platform,
          content,
          adaptationOptions,
          platformConfig
        );
        return { platform, result };
      }
    );

    const settled = await Promise.allSettled(promises);

    settled.forEach((promise, index) => {
      const platform = platforms[index].platform;

      if (promise.status === 'fulfilled') {
        results[platform] = promise.value.result;
      } else {
        results[platform] = {
          success: false,
          error: `Failed to publish: ${promise.reason}`,
        };
      }
    });

    return results;
  }

  // Private helper methods
  private getClient(platform: DestinationType): PlatformClient {
    const client = this.clients.get(platform);
    if (!client) {
      throw new Error(`No client registered for platform: ${platform}`);
    }
    return client;
  }

  private getAdapter(platform: DestinationType): ContentAdapter {
    const adapter = this.adapters.get(platform);
    if (!adapter) {
      throw new Error(`No adapter registered for platform: ${platform}`);
    }
    return adapter;
  }
}
