// lib/social/analytics.ts
import { prisma } from '@/lib/prisma';
import { SocialShareMetrics, PlatformId } from '@/types/social';

export async function trackShare(
  platformId: PlatformId, 
  collectionId: string,
  success: boolean
) {
  try {
    await prisma.socialMetrics.upsert({
      where: {
        platformId_collectionId: {
          platformId,
          collectionId
        }
      },
      update: {
        shareCount: { increment: 1 },
        lastShared: new Date(),
        successCount: success ? { increment: 1 } : undefined,
        failureCount: !success ? { increment: 1 } : undefined
      },
      create: {
        platformId,
        collectionId,
        shareCount: 1,
        lastShared: new Date(),
        successCount: success ? 1 : 0,
        failureCount: !success ? 1 : 0
      }
    });
  } catch (error) {
    console.error('Failed to track share:', error);
  }
}