import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { type, itemId, article, apiKey } = await req.json();

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Dev.to API token is required' },
        { status: 400 }
      );
    }

    // Publish to Dev.to
    const response = await fetch('https://dev.to/api/articles', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': apiKey
      },
      body: JSON.stringify(article)
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to publish to Dev.to: ${error}`);
    }

    const devToData = await response.json();
    const url = devToData.url;

    // Update the appropriate record based on type
    if (type === 'collection') {
      await prisma.collections.update({
        where: { id: itemId },
        data: { devToUrl: url }
      });
    } else if (type === 'publishingPlan') {
      await prisma.publishingPlan.update({
        where: { id: itemId },
        data: {
          devToUrl: url,
          publishedUrl: url,
          status: 'published',
          publishedAt: new Date()
        }
      });
    } else {
      throw new Error('Invalid publication type');
    }

    return NextResponse.json({ url });
  } catch (error) {
    console.error('Dev.to publishing error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to publish to Dev.to' },
      { status: 500 }
    );
  }
}