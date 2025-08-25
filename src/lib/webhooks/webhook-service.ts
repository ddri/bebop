// Webhook service for sending events to external automation platforms
import crypto from 'crypto';
import { WebhookConfig, WebhookEvent, WebhookPayload, WebhookDelivery } from './types';

export class WebhookService {
  private maxRetries = 3;
  private retryDelay = 1000; // 1 second

  /**
   * Trigger webhooks for a specific event
   */
  async trigger(event: WebhookEvent, data: Record<string, unknown>, webhooks: WebhookConfig[]) {
    // Filter webhooks that are subscribed to this event
    const subscribedWebhooks = webhooks.filter(
      webhook => webhook.enabled && webhook.events.includes(event)
    );

    // Send to all subscribed webhooks
    const deliveries = await Promise.allSettled(
      subscribedWebhooks.map(webhook => this.sendWebhook(webhook, event, data))
    );

    return deliveries;
  }

  /**
   * Send a webhook with retry logic
   */
  private async sendWebhook(
    webhook: WebhookConfig, 
    event: WebhookEvent, 
    data: Record<string, unknown>
  ): Promise<WebhookDelivery> {
    const payload = this.formatPayload(event, data, webhook.url);
    const headers = this.buildHeaders(webhook, payload);
    
    let attempts = 0;
    let lastError: Error | null = null;

    while (attempts < (webhook.retryCount || this.maxRetries)) {
      attempts++;

      try {
        const response = await fetch(webhook.url, {
          method: 'POST',
          headers,
          body: JSON.stringify(payload),
        });

        if (response.ok || response.status === 204) {
          return {
            id: crypto.randomUUID(),
            webhookId: webhook.id,
            event,
            url: webhook.url,
            payload,
            status: 'success',
            statusCode: response.status,
            response: await response.text(),
            attempts,
            createdAt: new Date(),
            deliveredAt: new Date(),
          };
        }

        // Handle specific status codes
        if (response.status === 410) {
          // Gone - webhook endpoint no longer exists
          console.log(`Webhook endpoint gone: ${webhook.url}`);
          break;
        }

        if (response.status >= 500) {
          // Server error - retry
          lastError = new Error(`Server error: ${response.status}`);
          await this.delay(webhook.retryDelay || this.retryDelay);
          continue;
        }

        // Client error - don't retry
        break;

      } catch (error) {
        lastError = error as Error;
        
        if (attempts < (webhook.retryCount || this.maxRetries)) {
          await this.delay(webhook.retryDelay || this.retryDelay);
        }
      }
    }

    // Failed after all retries
    return {
      id: crypto.randomUUID(),
      webhookId: webhook.id,
      event,
      url: webhook.url,
      payload,
      status: 'failed',
      error: lastError?.message || 'Unknown error',
      attempts,
      createdAt: new Date(),
    };
  }

  /**
   * Format payload based on webhook URL (detect platform)
   */
  private formatPayload(event: WebhookEvent, data: Record<string, unknown>, url: string): WebhookPayload {
    const basePayload: WebhookPayload = {
      event,
      timestamp: new Date().toISOString(),
      data: {
        id: data.id || crypto.randomUUID(),
        type: this.determineType(data),
        ...data,
      },
      metadata: {
        userId: data.userId,
        campaignId: data.campaignId,
        platform: data.platform,
        scheduledFor: data.scheduledFor,
      },
    };

    // Platform-specific formatting
    if (url.includes('zapier.com')) {
      // Flatten for Zapier
      return this.flattenForZapier(basePayload);
    } else if (url.includes('make.com') || url.includes('integromat.com')) {
      // Make.com (formerly Integromat) handles nested JSON well
      return basePayload;
    } else if (url.includes('n8n.io') || url.includes(':5678')) {
      // n8n typically runs on port 5678
      return basePayload;
    }

    // Default format
    return basePayload;
  }

  /**
   * Flatten payload for Zapier (easier field mapping)
   */
  private flattenForZapier(payload: WebhookPayload): WebhookPayload {
    const flattened: WebhookPayload & { flat_data?: Record<string, unknown> } = {
      ...payload,
      flat_data: {},
    };

    // Flatten nested data
    Object.entries(payload.data).forEach(([key, value]) => {
      if (typeof value === 'object' && value !== null) {
        Object.entries(value).forEach(([nestedKey, nestedValue]) => {
          flattened.flat_data[`${key}_${nestedKey}`] = nestedValue;
        });
      } else {
        flattened.flat_data[key] = value;
      }
    });

    return flattened;
  }

  /**
   * Build headers including HMAC signature if configured
   */
  private buildHeaders(webhook: WebhookConfig, payload: WebhookPayload): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'User-Agent': 'Bebop-Webhook/1.0',
      'X-Bebop-Event': payload.event,
      'X-Bebop-Timestamp': payload.timestamp,
      ...webhook.headers,
    };

    // Add HMAC signature for security
    if (webhook.secret) {
      const signature = this.generateSignature(payload, webhook.secret);
      headers['X-Bebop-Signature'] = signature;
    }

    return headers;
  }

  /**
   * Generate HMAC signature for webhook security
   */
  private generateSignature(payload: WebhookPayload, secret: string): string {
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(JSON.stringify(payload));
    return `sha256=${hmac.digest('hex')}`;
  }

  /**
   * Determine content type from data
   */
  private determineType(data: Record<string, unknown>): 'topic' | 'campaign' | 'publication' {
    if (data.topicId || data.content) return 'topic';
    if (data.campaignId || data.publishingPlans) return 'campaign';
    return 'publication';
  }

  /**
   * Delay helper for retries
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Test webhook endpoint
   */
  async testWebhook(webhook: WebhookConfig): Promise<boolean> {
    const testPayload: WebhookPayload = {
      event: 'content.created',
      timestamp: new Date().toISOString(),
      data: {
        id: 'test-' + crypto.randomUUID(),
        type: 'topic',
        test: true,
        message: 'This is a test webhook from Bebop',
      },
    };

    try {
      const response = await fetch(webhook.url, {
        method: 'POST',
        headers: this.buildHeaders(webhook, testPayload),
        body: JSON.stringify(testPayload),
      });

      return response.ok || response.status === 204;
    } catch (error) {
      console.error('Webhook test failed:', error);
      return false;
    }
  }
}