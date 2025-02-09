// src/app/api/social/threads/test/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const response = await fetch('https://graph.facebook.com/v22.0/me/threads', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.THREADS_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text: "Test post from Bebop CMS 🚀",
      })
    });

    const responseText = await response.text();
    console.log('Full response:', responseText);

    return NextResponse.json({
      status: response.status,
      response: responseText,
      endpoint: 'graph.facebook.com v22.0'
    });
  } catch (error) {
    console.error('Threads API test failed:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Failed to test Threads API'
    }, { status: 500 });
  }
}