// src/app/api/social/threads/route.ts
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { url, text } = await request.json();

    // Basic validation
    if (!url || !text) {
      return NextResponse.json(
        { error: 'URL and text are required' },
        { status: 400 }
      );
    }

    // Call Threads API
    const response = await fetch('https://graph.instagram.com/v12.0/me/threads', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.THREADS_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: `${text}\n\n${url}`
      })
    });

    if (!response.ok) {
      throw new Error('Failed to post to Threads');
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Threads post failed:', error);
    return NextResponse.json(
      { error: 'Failed to post to Threads' },
      { status: 500 }
    );
  }
}