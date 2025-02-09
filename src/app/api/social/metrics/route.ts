// app/api/social/metrics/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { PlatformId } from '@/types/social';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { platformId, collectionId } = body;

    if (!platformId || !collectionId) {
      return NextResponse.json(
        { error: 'Platform ID and Collection ID are required' },
        { status: 400 }
      );
    }

    // Validate that the collection exists
    const collection = await prisma.collection.findUnique({
      where: { id: collectionId }
    });

    if (!collection) {
      return NextResponse.json(
        { error: 'Collection not found' },
        { status: 404 }
      );
    }

    // Upsert the social metrics record
    const metrics = await prisma.socialMetrics.upsert({
      where: {
        platformId_collectionId: {
          platformId: platformId as PlatformId,
          collectionId: collectionId
        }
      },
      update: {
        shareCount: { increment: 1 },
        lastShared: new Date()
      },
      create: {
        platformId: platformId as PlatformId,
        collectionId: collectionId,
        shareCount: 1,
        successCount: 0,
        failureCount: 0,
        lastShared: new Date()
      }
    });

    return NextResponse.json(metrics);
  } catch (error) {
    console.error('Error updating social metrics:', error);
    return NextResponse.json(
      { error: 'Failed to update social metrics' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { platformId, collectionId, success } = body;

    if (!platformId || !collectionId || typeof success !== 'boolean') {
      return NextResponse.json(
        { error: 'Platform ID, Collection ID, and success status are required' },
        { status: 400 }
      );
    }

    // Update the success/failure count
    const metrics = await prisma.socialMetrics.update({
      where: {
        platformId_collectionId: {
          platformId: platformId as PlatformId,
          collectionId: collectionId
        }
      },
      data: {
        [success ? 'successCount' : 'failureCount']: { increment: 1 }
      }
    });

    return NextResponse.json(metrics);
  } catch (error) {
    console.error('Error updating share result:', error);
    return NextResponse.json(
      { error: 'Failed to update share result' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const metrics = await prisma.socialMetrics.findMany();
    return NextResponse.json(metrics);
  } catch (error) {
    console.error('Error fetching social metrics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch social metrics' },
      { status: 500 }
    );
  }
}