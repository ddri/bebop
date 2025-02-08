// app/api/social/share/route.ts
import { NextResponse } from 'next/server';
import { BlueskyClient } from '@/lib/social/clients/BlueskyClient';
import { MastodonClient } from '@/lib/social/clients/MastodonClient';
import { PlatformId, SocialShareContent, SocialCredentials } from '@/types/social';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { platformId, credentials, content } = body as {
      platformId: PlatformId;
      credentials: SocialCredentials;
      content: SocialShareContent;
    };

    // Validate required fields
    if (!platformId || !credentials || !content) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    let client;
    let response;

    try {
      switch (platformId) {
        case 'mastodon':
          client = new MastodonClient();
          await client.authenticate(credentials);
          response = await client.share(content);
          break;
          
        case 'bluesky':
          client = new BlueskyClient();
          await client.authenticate(credentials);
          response = await client.share(content);
          break;

        case 'threads':
          // Threads uses web intents, shouldn't reach here
          return NextResponse.json(
            { success: false, error: 'Platform not supported via API' },
            { status: 400 }
          );

        default:
          return NextResponse.json(
            { success: false, error: 'Unsupported platform' },
            { status: 400 }
          );
      }

      if (!response.success) {
        console.error('Share failed:', response.error);
        return NextResponse.json(
          { success: false, error: response.error || 'Share failed' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        url: response.url,
        platformPostId: response.platformPostId
      });

    } catch (error) {
      console.error('Share error:', error);
      return NextResponse.json(
        { 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to share'
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Route error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}