// Trigger webhooks for an event
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateRequest } from '@/lib/auth';
import { WebhookService } from '@/lib/webhooks/webhook-service';

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

    // Trigger webhooks
    const results = await webhookService.trigger(event, data, webhooks);

    // Log deliveries
    for (const result of results) {
      if (result.status === 'fulfilled') {
        const delivery = result.value;
        await prisma.webhookDelivery.create({
          data: {
            webhookId: delivery.value.webhookId,
            event: delivery.value.event,
            url: delivery.value.url,
            payload: delivery.value.payload as object,
            status: delivery.value.status,
            statusCode: delivery.value.statusCode,
            response: delivery.value.response ? JSON.parse(delivery.value.response as string) : undefined,
            error: delivery.value.error,
            attempts: delivery.value.attempts,
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