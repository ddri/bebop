// lib/social/clients/MastodonClient.ts
import { createRestAPIClient } from 'masto';
import { AbstractSocialClient } from '../AbstractSocialClient';
import { SocialShareContent, SocialShareResponse, SocialCredentials } from '@/types/social';

export class MastodonClient extends AbstractSocialClient {
  private client: any;
  private instance: string;

  constructor(instance: string) {
    super();
    this.instance = instance;
  }

  async authenticate(credentials: SocialCredentials): Promise<boolean> {
    try {
      if (!credentials.token) {
        throw new Error('Access token is required');
      }
      
      this.client = createRestAPIClient({
        url: this.instance,
        accessToken: credentials.token,
      });
      this.authenticated = true;
      return true;
    } catch (error) {
      this.authenticated = false;
      return false;
    }
  }

  async share(content: SocialShareContent): Promise<SocialShareResponse> {
    if (!this.authenticated) {
      return { success: false, error: 'Not authenticated' };
    }
  
    try {
      const status = await this.client.statuses.create({
        status: content.text,
        visibility: 'public',
      });
  
      return { success: true, url: status.url };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Share failed' 
      };
    }
  }

  async logout(): Promise<void> {
    this.authenticated = false;
    this.client = null;
  }
}