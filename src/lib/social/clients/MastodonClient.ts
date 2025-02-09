// lib/social/clients/MastodonClient.ts
import { AbstractSocialClient } from '../AbstractSocialClient';
import { SocialCredentials, SocialShareContent, SocialShareResponse } from '@/types/social';

export class MastodonClient extends AbstractSocialClient {
  private instance: string;
  private token: string | null = null;

  constructor() {
    super();
    this.instance = '';
  }

  private cleanInstanceUrl(url: string): string {
    try {
      // Remove any trailing paths like /start
      const parsedUrl = new URL(url);
      return `${parsedUrl.protocol}//${parsedUrl.host}`;
    } catch (error) {
      throw new Error('Invalid instance URL format');
    }
  }

  async authenticate(credentials: SocialCredentials): Promise<boolean> {
    if (!credentials.instanceUrl || !credentials.token) {
      throw new Error('Instance URL and access token are required');
    }

    try {
      this.instance = this.cleanInstanceUrl(credentials.instanceUrl);
      this.token = credentials.token;

      const response = await fetch(`${this.instance}/api/v1/accounts/verify_credentials`, {
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        let errorMessage = 'Authentication failed';
        
        if (contentType?.includes('application/json')) {
          const error = await response.json();
          errorMessage = error.error || errorMessage;
        } else {
          const text = await response.text();
          console.error('Non-JSON error response:', text);
          throw new Error('Invalid response from server');
        }
        
        throw new Error(errorMessage);
      }

      this.authenticated = true;
      return true;
    } catch (error) {
      this.authenticated = false;
      if (error instanceof Error) {
        throw new Error(`Authentication failed: ${error.message}`);
      }
      throw new Error('Authentication failed');
    }
  }

  async share(content: SocialShareContent): Promise<SocialShareResponse> {
    if (!this.authenticated || !this.token) {
      throw new Error('Not authenticated');
    }

    try {
      // Format the status message
      const statusText = this.formatStatusText(content);

      const response = await fetch(`${this.instance}/api/v1/statuses`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          status: statusText,
          visibility: 'public'
        })
      });

      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        let errorMessage = 'Failed to post to Mastodon';

        if (contentType?.includes('application/json')) {
          const error = await response.json();
          errorMessage = error.error || errorMessage;
        } else {
          const text = await response.text();
          console.error('Non-JSON error response:', text);
          errorMessage = `Server error: ${response.status}`;
        }

        throw new Error(errorMessage);
      }

      const data = await response.json();
      return {
        success: true,
        url: data.url,
        platformPostId: data.id
      };
    } catch (error) {
      console.error('Share error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to share'
      };
    }
  }

  private formatStatusText(content: SocialShareContent): string {
    const parts = [];

    if (content.title) {
      parts.push(content.title);
    }

    if (content.text) {
      parts.push(content.text);
    }

    if (content.url) {
      parts.push(content.url);
    }

    // Join with line breaks and ensure proper spacing
    return parts
      .filter(Boolean)
      .join('\n\n')
      .trim();
  }

  async logout(): Promise<void> {
    this.authenticated = false;
    this.token = null;
  }
}