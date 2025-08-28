// Test webhook endpoint
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateRequest } from '@/lib/auth';
import { WebhookService } from '@/lib/webhooks/webhook-service';
import { WebhookEvent } from '@/lib/webhooks/types';

const webhookService = new WebhookService();

// POST /api/webhooks/test - Test a webhook
export async function POST(req: Request) {
  const authResult = await authenticateRequest();
  if (authResult.error) {
    return authResult.error;
  }

  try {
    const body = await req.json();
    
    if (!body.id) {
      return NextResponse.json(
        { error: 'Webhook ID is required' },
        { status: 400 }
      );
    }

    // Get webhook and verify ownership
    const webhook = await prisma.webhook.findUnique({
      where: { id: body.id },
    });

    if (!webhook || webhook.userId !== authResult.userId) {
      return NextResponse.json(
        { error: 'Webhook not found' },
        { status: 404 }
      );
    }

    // Convert Prisma webhook to WebhookConfig format
    const webhookConfig = {
      id: webhook.id,
      name: webhook.name,
      url: webhook.url,
      enabled: webhook.enabled,
      events: webhook.events as WebhookEvent[],
      headers: webhook.headers ? JSON.parse(JSON.stringify(webhook.headers)) : undefined,
      secret: webhook.secret || undefined,
      retryCount: webhook.retryCount,
      retryDelay: webhook.retryDelay,
      createdAt: webhook.createdAt,
      updatedAt: webhook.updatedAt,
    };

    // Test the webhook
    const success = await webhookService.testWebhook(webhookConfig);

    // Log the test
    await prisma.webhookDelivery.create({
      data: {
        webhookId: webhook.id,
        event: 'content.created',
        url: webhook.url,
        payload: {
          event: 'content.created',
          timestamp: new Date().toISOString(),
          data: {
            id: 'test',
            type: 'topic',
            test: true,
          },
        },
        status: success ? 'success' : 'failed',
        statusCode: success ? 200 : 0,
        attempts: 1,
      },
    });

    return NextResponse.json({ 
      success,
      message: success 
        ? 'Webhook test successful' 
        : 'Webhook test failed - check URL and configuration'
    });
  } catch (error) {
    console.error('Error testing webhook:', error);
    return NextResponse.json(
      { error: 'Failed to test webhook' },
      { status: 500 }
    );
  }
}