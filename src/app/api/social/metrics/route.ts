// src/app/api/social/metrics/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { PlatformId } from '@/types/social';

export async function GET() {
  try {
    const metrics = await prisma.SocialMetrics.findMany();
    return NextResponse.json(metrics);
  } catch (error) {
    console.error('Failed to fetch social metrics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch social metrics' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { platformId, collectionId } = await request.json();

    // Upsert the social metrics record
    const metrics = await prisma.SocialMetrics.upsert({
      where: {
        platformId_collectionId: {
          platformId,
          collectionId
        }
      },
      update: {
        shareCount: {
          increment: 1
        }
      },
      create: {
        platformId,
        collectionId,
        shareCount: 1,
        successCount: 0,
        failureCount: 0
      }
    });

    return NextResponse.json(metrics);
  } catch (error) {
    console.error('Failed to update social metrics:', error);
    return NextResponse.json(
      { error: 'Failed to update social metrics' },
      { status: 500 }
    );
  }
}