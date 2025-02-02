// app/api/publish/medium/route.ts
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { article, apiKey } = await request.json();

    // First, get the authenticated user's details
    const userResponse = await fetch('https://api.medium.com/v1/me', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      }
    });

    if (!userResponse.ok) {
      return NextResponse.json(
        { error: 'Failed to authenticate with Medium' },
        { status: userResponse.status }
      );
    }

    const userData = await userResponse.json();
    const userId = userData.data.id;

    // Then create the post
    const createResponse = await fetch(`https://api.medium.com/v1/users/${userId}/posts`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        title: article.title,
        contentFormat: article.contentFormat,
        content: article.content,
        tags: article.tags,
        publishStatus: article.publishStatus,
      })
    });

    if (!createResponse.ok) {
      const error = await createResponse.json();
      return NextResponse.json(
        { error: error.errors?.[0]?.message || 'Failed to publish to Medium' },
        { status: createResponse.status }
      );
    }

    const data = await createResponse.json();
    return NextResponse.json({
      url: data.data.url,
      id: data.data.id
    });
  } catch (error) {
    console.error('Failed to publish to Medium:', error);
    return NextResponse.json(
      { error: 'Failed to publish to Medium' },
      { status: 500 }
    );
  }
}