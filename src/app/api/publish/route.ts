import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';

export async function POST(request: Request) {
  try {
    const { fileName, content } = await request.json();

    // Create the published directory if it doesn't exist
    const publishDir = path.join(process.cwd(), 'public', 'published');
    
    // Write the file
    await writeFile(
      path.join(publishDir, fileName),
      content,
      'utf-8'
    );

    return NextResponse.json({ 
      success: true,
      url: `/published/${fileName}` 
    });
  } catch (error) {
    console.error('Publishing error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to publish' },
      { status: 500 }
    );
  }
}