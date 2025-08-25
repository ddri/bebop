// Webhook system types for Bebop
// Supports Zapier, Make.com, n8n, and custom webhooks

export interface WebhookConfig {
  id: string;
  name: string;
  url: string;
  enabled: boolean;
  events: WebhookEvent[];
  headers?: Record<string, string>;
  secret?: string; // For HMAC signing
  retryCount?: number;
  retryDelay?: number; // milliseconds
  createdAt: Date;
  updatedAt: Date;
}

export type WebhookEvent = 
  | 'content.created'
  | 'content.updated'
  | 'content.deleted'
  | 'content.published'
  | 'content.scheduled'
  | 'publish.success'
  | 'publish.failed'
  | 'campaign.created'
  | 'campaign.updated'
  | 'campaign.completed';

export interface WebhookPayload {
  event: WebhookEvent;
  timestamp: string;
  data: {
    id: string;
    type: 'topic' | 'campaign' | 'publication';
    [key: string]: unknown;
  };
  metadata?: {
    userId?: string;
    campaignId?: string;
    platform?: string;
    scheduledFor?: string;
  };
}

// Platform-specific payload formats
export interface ZapierPayload extends WebhookPayload {
  // Zapier prefers flat structure for easier mapping
  flat_data?: Record<string, string | number | boolean>;
}

export interface MakePayload extends WebhookPayload {
  // Make.com handles nested JSON well
  nested_data?: Record<string, unknown>;
}

export interface N8nPayload extends WebhookPayload {
  // n8n can handle complex structures
  workflow_data?: Record<string, unknown>;
}

export interface WebhookDelivery {
  id: string;
  webhookId: string;
  event: WebhookEvent;
  url: string;
  payload: WebhookPayload;
  status: 'pending' | 'success' | 'failed';
  statusCode?: number;
  response?: string;
  error?: string;
  attempts: number;
  createdAt: Date;
  deliveredAt?: Date;
}

export interface WebhookSubscription {
  id: string;
  userId: string;
  webhookConfig: WebhookConfig;
  lastTriggeredAt?: Date;
  totalDeliveries: number;
  successfulDeliveries: number;
  failedDeliveries: number;
}