// Trigger webhooks for an event
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateRequest } from '@/lib/auth';
import { WebhookService } from '@/lib/webhooks/webhook-service';
import { WebhookEvent } from '@/lib/webhooks/types';

const webhookService = new WebhookService();

// POST /api/webhooks/trigger - Trigger webhooks for an event
export async function POST(req: Request) {
  const authResult = await authenticateRequest();
  if (authResult.error) {
    return authResult.error;
  }

  try {
    const body = await req.json();
    const { event, data } = body;

    if (!event || !data) {
      return NextResponse.json(
        { error: 'Event and data are required' },
        { status: 400 }
      );
    }

    // Get all enabled webhooks for this user
    const webhooks = await prisma.webhook.findMany({
      where: {
        userId: authResult.userId,
        enabled: true,
      },
    });

    // Convert Prisma webhooks to WebhookConfig format
    const webhookConfigs = webhooks.map(webhook => ({
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
    }));

    // Trigger webhooks
    const results = await webhookService.trigger(event, data, webhookConfigs);

    // Log deliveries
    for (const result of results) {
      if (result.status === 'fulfilled') {
        const delivery = result.value;
        await prisma.webhookDelivery.create({
          data: {
            webhookId: delivery.webhookId,
            event: delivery.event,
            url: delivery.url,
            payload: delivery.payload as object,
            status: delivery.status,
            statusCode: delivery.statusCode,
            response: delivery.response,
            error: delivery.error,
            attempts: delivery.attempts,
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      triggered: results.length,
      message: `Triggered ${results.length} webhooks`,
    });
  } catch (error) {
    console.error('Error triggering webhooks:', error);
    return NextResponse.json(
      { error: 'Failed to trigger webhooks' },
      { status: 500 }
    );
  }
}