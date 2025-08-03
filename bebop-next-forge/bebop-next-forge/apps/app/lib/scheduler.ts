import { database } from '@repo/database';
import { DestinationType, ScheduleStatus } from '@repo/database/types';
import {
  BlueskyClient,
  type BlueskyCredentials,
  DevtoClient,
  type DevtoCredentials,
  HashnodeClient,
  type HashnodeCredentials,
  MastodonClient,
  type MastodonCredentials,
} from '@repo/integrations';
import * as cron from 'node-cron';

interface SchedulerService {
  checkPendingJobs(): Promise<void>;
  publishNow(scheduleId: string): Promise<void>;
  retryFailed(scheduleId: string): Promise<void>;
  start(): void;
  stop(): void;
}

class SimpleScheduler implements SchedulerService {
  private task: cron.ScheduledTask | null = null;
  private isRunning = false;

  start() {
    if (this.task) {
      console.log('Scheduler already running');
      return;
    }

    // Run every minute to check for pending schedules
    this.task = cron.schedule('* * * * *', async () => {
      if (this.isRunning) {
        console.log('Previous check still running, skipping...');
        return;
      }

      try {
        this.isRunning = true;
        await this.checkPendingJobs();
      } catch (error) {
        console.error('Error checking pending jobs:', error);
      } finally {
        this.isRunning = false;
      }
    });

    console.log('📅 Publishing scheduler started');
  }

  stop() {
    if (this.task) {
      this.task.stop();
      this.task = null;
      console.log('📅 Publishing scheduler stopped');
    }
  }

  async checkPendingJobs(): Promise<void> {
    const now = new Date();
    const timestamp = now.toISOString();

    // Find all schedules that are due to be published
    const pendingSchedules = await database.schedule.findMany({
      where: {
        status: ScheduleStatus.PENDING,
        publishAt: {
          lte: now,
        },
      },
      include: {
        content: true,
        destination: true,
        campaign: true,
      },
    });

    console.log(
      `[${timestamp}] 📋 Scheduler check: Found ${pendingSchedules.length} schedules ready to publish`
    );

    if (pendingSchedules.length === 0) {
      console.log(`[${timestamp}] ✨ No schedules due for publishing`);
      return;
    }

    // Process each schedule
    for (const schedule of pendingSchedules) {
      try {
        console.log(
          `[${timestamp}] 🚀 Processing schedule ${schedule.id} - "${schedule.content.title}" → ${schedule.destination.name}`
        );
        await this.processSchedule(schedule);
      } catch (error) {
        console.error(
          `[${timestamp}] ❌ Error processing schedule ${schedule.id}:`,
          error
        );
        await this.markScheduleFailed(schedule.id, String(error));
      }
    }
  }

  async publishNow(scheduleId: string): Promise<void> {
    const schedule = await database.schedule.findUnique({
      where: { id: scheduleId },
      include: {
        content: true,
        destination: true,
        campaign: true,
      },
    });

    if (!schedule) {
      throw new Error(`Schedule ${scheduleId} not found`);
    }

    await this.processSchedule(schedule);
  }

  async retryFailed(scheduleId: string): Promise<void> {
    const schedule = await database.schedule.findUnique({
      where: { id: scheduleId },
      include: {
        content: true,
        destination: true,
        campaign: true,
      },
    });

    if (!schedule) {
      throw new Error(`Schedule ${scheduleId} not found`);
    }

    if (schedule.status !== ScheduleStatus.FAILED) {
      throw new Error(`Schedule ${scheduleId} is not in failed state`);
    }

    // Reset attempts and process
    await database.schedule.update({
      where: { id: scheduleId },
      data: {
        status: ScheduleStatus.PENDING,
        attempts: 0,
        error: null,
      },
    });

    await this.processSchedule(schedule);
  }

  private async processSchedule(schedule: {
    id: string;
    content: { title: string; body: string; excerpt?: string | null };
    destination: { name: string; type: string; config: unknown };
    attempts: number;
  }): Promise<void> {
    const { id, content, destination, attempts } = schedule;

    // Check if we've exceeded max attempts
    if (attempts >= 3) {
      await this.markScheduleFailed(id, 'Maximum retry attempts exceeded');
      return;
    }

    // Mark as publishing
    await database.schedule.update({
      where: { id },
      data: {
        status: ScheduleStatus.PUBLISHING,
        attempts: attempts + 1,
        lastAttemptAt: new Date(),
      },
    });

    try {
      // Simulate publishing logic - we'll implement this properly next
      await this.publishToDestination(content, destination);

      // Mark as published
      await database.schedule.update({
        where: { id },
        data: {
          status: ScheduleStatus.PUBLISHED,
          publishedAt: new Date(),
          error: null,
        },
      });

      console.log(
        `✅ Published schedule ${id} to ${destination.name} (${destination.type})`
      );
    } catch (error) {
      const errorMessage = String(error);
      const timestamp = new Date().toISOString();

      console.error(
        `[${timestamp}] ❌ Publishing failed for schedule ${id} (attempt ${attempts + 1}/3):`,
        errorMessage
      );

      // If this was the last attempt, mark as failed
      if (attempts + 1 >= 3) {
        await this.markScheduleFailed(id, errorMessage);
      } else {
        // Set back to pending for retry in 5 minutes
        const retryAt = new Date(Date.now() + 5 * 60 * 1000);
        await database.schedule.update({
          where: { id },
          data: {
            status: ScheduleStatus.PENDING,
            error: errorMessage,
            publishAt: retryAt,
          },
        });
        console.log(
          `[${timestamp}] ⏰ Will retry schedule ${id} at ${retryAt.toISOString()} (attempt ${attempts + 1}/3)`
        );
      }
    }
  }

  private async markScheduleFailed(
    scheduleId: string,
    error: string
  ): Promise<void> {
    await database.schedule.update({
      where: { id: scheduleId },
      data: {
        status: ScheduleStatus.FAILED,
        error: error,
      },
    });
    console.log(`❌ Schedule ${scheduleId} failed: ${error}`);
  }

  private async publishToDestination(
    content: { title: string; body: string; excerpt?: string | null },
    destination: { name: string; type: string; config: unknown }
  ): Promise<{ url: string }> {
    console.log(
      `Publishing "${content.title}" to ${destination.name} (${destination.type})`
    );

    try {
      // Get the appropriate platform client
      const client = await this.getPlatformClient(destination);

      // Adapt content for the platform
      const adaptedContent = await this.adaptContentForPlatform(
        content,
        destination
      );

      // Publish to the platform
      const result = await client.publish(adaptedContent);

      console.log(
        `✅ Published successfully to ${destination.type}:`,
        result.url
      );
      return result;
    } catch (error) {
      console.error(`❌ Failed to publish to ${destination.type}:`, error);
      throw error;
    }
  }

  private async getPlatformClient(destination: {
    type: string;
    config: unknown;
  }): Promise<{
    publish: (content: Record<string, unknown>) => Promise<{ url: string }>;
  }> {
    const { type, config } = destination;
    const configObj = config as Record<string, unknown>;

    switch (type) {
      case DestinationType.HASHNODE: {
        const hashnodeCredentials = configObj as unknown as HashnodeCredentials;
        const client = new HashnodeClient();

        // Authenticate the client
        await client.authenticate({
          type: 'api-key',
          data: {
            personalAccessToken: hashnodeCredentials.personalAccessToken,
          },
        });

        return {
          publish: async (content: Record<string, unknown>) => {
            console.log('🚀 Publishing to Hashnode:', content.title);

            const adaptedContent = {
              title: String(content.title || ''),
              body: String(content.body || ''),
              tags: (content.tags as string[]) || [],
            };

            const result = await client.publish(adaptedContent, {
              subtitle: String(content.excerpt || ''),
              enableTableOfContents: true,
              isNewsletterActivated: false,
            });

            if (!result.success) {
              throw new Error(result.error || 'Failed to publish to Hashnode');
            }

            return { url: result.platformUrl || '' };
          },
        };
      }

      case DestinationType.DEVTO: {
        const devtoCredentials = configObj as unknown as DevtoCredentials;
        const client = new DevtoClient();

        // Authenticate the client
        await client.authenticate({
          type: 'api-key',
          data: {
            apiKey: devtoCredentials.apiKey,
          },
        });

        return {
          publish: async (content: Record<string, unknown>) => {
            console.log('🚀 Publishing to Dev.to:', content.title);

            const adaptedContent = {
              title: String(content.title || ''),
              body: String(content.body || ''),
              tags: (content.tags as string[]) || [],
            };

            const result = await client.publish(adaptedContent, {
              description: String(content.excerpt || ''),
              published: true,
            });

            if (!result.success) {
              throw new Error(result.error || 'Failed to publish to Dev.to');
            }

            return { url: result.platformUrl || '' };
          },
        };
      }

      case DestinationType.BLUESKY: {
        const blueskyCredentials = configObj as unknown as BlueskyCredentials;
        const client = new BlueskyClient();

        // Authenticate the client
        await client.authenticate({
          type: 'api-key',
          data: {
            identifier: blueskyCredentials.identifier,
            password: blueskyCredentials.password,
          },
        });

        return {
          publish: async (content: Record<string, unknown>) => {
            console.log(
              '🚀 Publishing to Bluesky:',
              String(content.text || '').substring(0, 50) + '...'
            );

            const adaptedContent = {
              title: content.text
                ? String(content.text)
                : String(content.title || ''),
              body: content.text
                ? String(content.text)
                : String(content.title || ''),
              tags: (content.tags as string[]) || [],
            };

            const result = await client.publish(adaptedContent, {
              images: (content.images as { url: string; alt: string }[]) || [],
              language: 'en',
            });

            if (!result.success) {
              throw new Error(result.error || 'Failed to publish to Bluesky');
            }

            return { url: result.platformUrl || '' };
          },
        };
      }

      case DestinationType.MASTODON: {
        const mastodonCredentials = configObj as unknown as MastodonCredentials;
        const client = new MastodonClient();

        // Authenticate the client
        await client.authenticate({
          type: 'api-key',
          data: {
            accessToken: mastodonCredentials.accessToken,
            instanceUrl: mastodonCredentials.instanceUrl,
          },
        });

        return {
          publish: async (content: Record<string, unknown>) => {
            console.log(
              '🚀 Publishing to Mastodon:',
              String(content.status || '').substring(0, 50) + '...'
            );

            const adaptedContent = {
              title: content.status
                ? String(content.status)
                : String(content.title || ''),
              body: content.status
                ? String(content.status)
                : String(content.title || ''),
              tags: (content.tags as string[]) || [],
            };

            const result = await client.publish(adaptedContent, {
              mediaIds: (content.mediaIds as string[]) || [],
              sensitive: Boolean(content.sensitive),
              spoilerText: content.spoilerText
                ? String(content.spoilerText)
                : undefined,
              visibility:
                (content.visibility as
                  | 'public'
                  | 'unlisted'
                  | 'private'
                  | 'direct') || 'public',
              language: 'en',
            });

            if (!result.success) {
              throw new Error(result.error || 'Failed to publish to Mastodon');
            }

            return { url: result.platformUrl || '' };
          },
        };
      }

      default:
        throw new Error(`Unsupported destination type: ${type}`);
    }
  }

  private async adaptContentForPlatform(
    content: { title: string; body: string; excerpt?: string | null },
    destination: { type: string }
  ): Promise<Record<string, unknown>> {
    const { type } = destination;

    // Basic content adaptation - we can enhance this later
    const baseContent = {
      title: content.title,
      body: content.body,
      excerpt: content.excerpt,
    };

    switch (type) {
      case DestinationType.HASHNODE:
        return {
          ...baseContent,
          tags: this.extractTags(content.body),
          coverImageUrl: this.extractFirstImage(content.body),
        };

      case DestinationType.DEVTO:
        return {
          ...baseContent,
          tags: this.extractTags(content.body),
          published: true,
        };

      case DestinationType.BLUESKY:
        // For Bluesky, we use excerpt or truncated title
        return {
          text:
            content.excerpt ||
            this.truncateText(content.title + '\n\n' + content.body, 280),
        };

      case DestinationType.MASTODON:
        // Similar to Bluesky but with different character limits
        return {
          status:
            content.excerpt ||
            this.truncateText(content.title + '\n\n' + content.body, 500),
          visibility: 'public',
        };

      default:
        return baseContent;
    }
  }

  private extractTags(content: string): string[] {
    // Simple tag extraction from hashtags in content
    const hashtags = content.match(/#[\w]+/g) || [];
    return hashtags.map((tag) => tag.substring(1)).slice(0, 5); // Max 5 tags
  }

  private extractFirstImage(content: string): string | undefined {
    // Extract first image URL from markdown content
    const imageMatch = content.match(/!\[.*?\]\((.*?)\)/);
    return imageMatch ? imageMatch[1] : undefined;
  }

  private truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
  }
}

// Create singleton instance
export const scheduler = new SimpleScheduler();

// Auto-start in production/development
if (typeof window === 'undefined') {
  // Server-side only
  scheduler.start();
}
