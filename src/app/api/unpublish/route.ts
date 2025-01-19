import { NextResponse } from 'next/server';
import { unlink } from 'fs/promises';
import path from 'path';

export async function POST(request: Request) {
  try {
    const { fileName } = await request.json();
    
    // Delete the file
    const filePath = path.join(process.cwd(), 'public', 'published', fileName);
    await unlink(filePath);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Unpublishing error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to unpublish' },
      { status: 500 }
    );
  }
}