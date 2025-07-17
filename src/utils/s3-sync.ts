// src/utils/s3-sync.ts

import { ListObjectsCommand } from '@aws-sdk/client-s3';
import { s3Client } from '@/lib/s3';
import { prisma } from '@/lib/prisma';

export async function syncS3WithDatabase() {
  try {
    // List all objects in the S3 bucket
    const listCommand = new ListObjectsCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Prefix: 'uploads/', // Only look in uploads directory
    });

    const s3Objects = await s3Client.send(listCommand);
    const existingMediaItems = await prisma.mediaItem.findMany();
    const existingUrls = new Set(existingMediaItems.map(item => item.url));

    // Process each S3 object
    const createdItems = [];
    for (const object of s3Objects.Contents || []) {
      if (!object.Key || object.Key === 'uploads/') continue;

      const url = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${object.Key}`;

      // Skip if media item already exists
      if (existingUrls.has(url)) continue;

      // Extract filename from key
      const filename = object.Key.split('/').pop() || '';
      
      // Determine mime type based on extension
      const extension = filename.split('.').pop()?.toLowerCase();
      const mimeType = getMimeType(extension);

      // Create new media item
      const mediaItem = await prisma.mediaItem.create({
        data: {
          filename,
          url,
          size: object.Size || 0,
          mimeType,
          createdAt: object.LastModified || new Date(),
          updatedAt: object.LastModified || new Date(),
        }
      });

      createdItems.push(mediaItem);
    }

    return {
      success: true,
      message: `Synced ${createdItems.length} new items`,
      createdItems
    };
  } catch (error) {
    console.error('Failed to sync S3:', error);
    throw error;
  }
}

function getMimeType(extension?: string): string {
  const mimeTypes: Record<string, string> = {
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'webp': 'image/webp'
  };
  
  return mimeTypes[extension || ''] || 'application/octet-stream';
}

// Utility function to check sync status
export async function checkSyncStatus() {
  try {
    // Count objects in S3
    const listCommand = new ListObjectsCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Prefix: 'uploads/'
    });
    const s3Objects = await s3Client.send(listCommand);
    const s3Count = (s3Objects.Contents || [])
      .filter(obj => obj.Key && obj.Key !== 'uploads/').length;

    // Count database records
    const dbCount = await prisma.mediaItem.count();

    return {
      inSync: s3Count === dbCount,
      s3Count,
      dbCount
    };
  } catch (error) {
    console.error('Failed to check sync status:', error);
    throw error;
  }
}