// API endpoints for webhook management
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateRequest } from '@/lib/auth';
import { WebhookService } from '@/lib/webhooks/webhook-service';
import crypto from 'crypto';

const webhookService = new WebhookService();

// GET /api/webhooks - List all webhooks for the user
export async function GET() {
  const authResult = await authenticateRequest();
  if (authResult.error) {
    return authResult.error;
  }

  try {
    const webhooks = await prisma.webhook.findMany({
      where: { userId: authResult.userId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(webhooks);
  } catch (error) {
    console.error('Error fetching webhooks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch webhooks' },
      { status: 500 }
    );
  }
}

// POST /api/webhooks - Create a new webhook
export async function POST(req: Request) {
  const authResult = await authenticateRequest();
  if (authResult.error) {
    return authResult.error;
  }

  try {
    const body = await req.json();
    
    // Validate required fields
    if (!body.name || !body.url || !body.events || !Array.isArray(body.events)) {
      return NextResponse.json(
        { error: 'Name, URL, and events array are required' },
        { status: 400 }
      );
    }

    // Validate URL
    try {
      new URL(body.url);
    } catch {
      return NextResponse.json(
        { error: 'Invalid webhook URL' },
        { status: 400 }
      );
    }

    // Generate secret for HMAC signing
    const secret = crypto.randomBytes(32).toString('hex');

    const webhook = await prisma.webhook.create({
      data: {
        userId: authResult.userId,
        name: body.name,
        url: body.url,
        events: body.events,
        headers: body.headers || {},
        secret,
        enabled: true,
        retryCount: body.retryCount || 3,
        retryDelay: body.retryDelay || 1000,
      },
    });

    return NextResponse.json(webhook);
  } catch (error) {
    console.error('Error creating webhook:', error);
    return NextResponse.json(
      { error: 'Failed to create webhook' },
      { status: 500 }
    );
  }
}

// PUT /api/webhooks - Update a webhook
export async function PUT(req: Request) {
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

    // Verify ownership
    const existing = await prisma.webhook.findUnique({
      where: { id: body.id },
    });

    if (!existing || existing.userId !== authResult.userId) {
      return NextResponse.json(
        { error: 'Webhook not found' },
        { status: 404 }
      );
    }

    const webhook = await prisma.webhook.update({
      where: { id: body.id },
      data: {
        name: body.name,
        url: body.url,
        events: body.events,
        headers: body.headers,
        enabled: body.enabled,
        retryCount: body.retryCount,
        retryDelay: body.retryDelay,
      },
    });

    return NextResponse.json(webhook);
  } catch (error) {
    console.error('Error updating webhook:', error);
    return NextResponse.json(
      { error: 'Failed to update webhook' },
      { status: 500 }
    );
  }
}

// DELETE /api/webhooks - Delete a webhook
export async function DELETE(req: Request) {
  const authResult = await authenticateRequest();
  if (authResult.error) {
    return authResult.error;
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Webhook ID is required' },
        { status: 400 }
      );
    }

    // Verify ownership
    const existing = await prisma.webhook.findUnique({
      where: { id },
    });

    if (!existing || existing.userId !== authResult.userId) {
      return NextResponse.json(
        { error: 'Webhook not found' },
        { status: 404 }
      );
    }

    await prisma.webhook.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting webhook:', error);
    return NextResponse.json(
      { error: 'Failed to delete webhook' },
      { status: 500 }
    );
  }
}