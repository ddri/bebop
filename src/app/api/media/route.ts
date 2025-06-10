// app/api/media/route.ts

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { uploadFileToStorage } from '@/lib/storage';
import { authenticateRequest } from '@/lib/auth';
import { mkdir } from 'fs/promises';
import path from 'path';

// GET /api/media - List all media items
export async function GET() {
  // Check authentication
  const authResult = await authenticateRequest();
  if (authResult.error) {
    return authResult.error;
  }

  try {
    const mediaItems = await prisma.mediaItem.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(mediaItems);
  } catch (error) {
    console.error('Failed to fetch media items:', error);
    return NextResponse.json(
      { error: 'Failed to fetch media items' },
      { status: 500 }
    );
  }
}

// POST /api/media - Upload new media
export async function POST(request: Request) {
  // Check authentication
  const authResult = await authenticateRequest();
  if (authResult.error) {
    return authResult.error;
  }

  try {
    // Ensure uploads directory exists
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    await mkdir(uploadsDir, { recursive: true });

    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPG, PNG, GIF, and WebP are allowed.' },
        { status: 400 }
      );
    }

    // Upload file using our storage utility
    const fileUrl = await uploadFileToStorage(file);

    // Create media item in database
    const mediaItem = await prisma.mediaItem.create({
      data: {
        filename: file.name,
        url: fileUrl,
        size: file.size,
        mimeType: file.type,
      }
    });

    return NextResponse.json(mediaItem);
  } catch (error) {
    console.error('Failed to upload media:', error);
    return NextResponse.json(
      { error: 'Failed to upload media' },
      { status: 500 }
    );
  }
}