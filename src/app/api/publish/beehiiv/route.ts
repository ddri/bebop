import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface BeehiivPost {
  title: string;
  content: string;
  subtitle?: string;
  status?: 'confirmed' | 'draft';
}

export async function POST(req: Request) {
  try {
    const { type, itemId, article, apiKey, publicationId } = await req.json();

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Beehiiv API token is required' },
        { status: 400 }
      );
    }

    if (!publicationId) {
      return NextResponse.json(
        { error: 'Beehiiv publication ID is required' },
        { status: 400 }
      );
    }

    // Convert article format to Beehiiv format
    const beehiivPost: BeehiivPost = {
      title: article.title,
      content: article.body_markdown || article.content,
      subtitle: article.description,
      status: article.published === false ? 'draft' : 'confirmed'
    };

    // Publish to Beehiiv
    const response = await fetch(`https://api.beehiiv.com/v2/publications/${publicationId}/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(beehiivPost)
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to publish to Beehiiv: ${response.status} ${error}`);
    }

    const beehiivData = await response.json();
    
    // Construct the post URL - Beehiiv typically returns the post data with web URL
    const url = beehiivData.data?.web_url || `https://api.beehiiv.com/v2/posts/${beehiivData.data?.id}`;

    // Update the appropriate record based on type
    if (type === 'publishingPlan') {
      await prisma.publishingPlan.update({
        where: { id: itemId },
        data: {
          beehiivUrl: url,
          publishedUrl: url,
          status: 'published',
          publishedAt: new Date()
        }
      });
    } else {
      throw new Error('Invalid publication type');
    }

    return NextResponse.json({ 
      url,
      postId: beehiivData.data?.id,
      success: true 
    });
  } catch (error) {
    console.error('Beehiiv publishing error:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to publish to Beehiiv',
        success: false 
      },
      { status: 500 }
    );
  }
}