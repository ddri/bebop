import { NextRequest, NextResponse } from 'next/server';
import { BlueskyClient } from '@/lib/social/clients/BlueskyClient';
import { MastodonClient } from '@/lib/social/clients/MastodonClient';

export async function POST(request: NextRequest) {
  try {
    const { platform, credentials } = await request.json();

    if (!platform || !credentials) {
      return NextResponse.json(
        { message: 'Platform and credentials are required' },
        { status: 400 }
      );
    }

    let client;
    switch (platform) {
      case 'bluesky':
        client = new BlueskyClient();
        break;
      case 'mastodon':
        client = new MastodonClient();
        break;
      default:
        return NextResponse.json(
          { message: `Unsupported platform: ${platform}` },
          { status: 400 }
        );
    }

    // Test connection by attempting to get user profile
    try {
      const result = await client.testConnection(credentials);
      
      if (result.success) {
        return NextResponse.json({
          message: result.message || `Successfully connected to ${platform}`,
          details: result.userInfo
        });
      } else {
        return NextResponse.json(
          { 
            message: result.message || 'Connection failed',
            details: result.error 
          },
          { status: 401 }
        );
      }
    } catch (error) {
      console.error(`${platform} connection test error:`, error);
      return NextResponse.json(
        { 
          message: `Failed to connect to ${platform}`,
          details: error instanceof Error ? error.message : 'Unknown error'
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Connection test error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}