// src/app/api/media/sync/route.ts

import { NextResponse } from 'next/server';
import { syncS3WithDatabase, checkSyncStatus } from '@/utils/s3-sync';

export async function POST() {
  try {
    const result = await syncS3WithDatabase();
    return NextResponse.json(result);
  } catch (error) {
    console.error('Sync failed:', error);
    return NextResponse.json(
      { error: 'Failed to sync media items' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const status = await checkSyncStatus();
    return NextResponse.json(status);
  } catch (error) {
    console.error('Status check failed:', error);
    return NextResponse.json(
      { error: 'Failed to check sync status' },
      { status: 500 }
    );
  }
}