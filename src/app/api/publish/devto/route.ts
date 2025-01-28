import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { article, apiKey } = await request.json();

    const response = await fetch('https://dev.to/api/articles', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': apiKey,
        'Accept': 'application/vnd.forem.api-v1+json'
      },
      body: JSON.stringify(article)
    });

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(error, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Failed to publish to Dev.to:', error);
    return NextResponse.json(
      { error: 'Failed to publish to Dev.to' },
      { status: 500 }
    );
  }
}