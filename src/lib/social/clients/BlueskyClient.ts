// lib/social/clients/BlueskyClient.ts
import { BskyAgent } from '@atproto/api';  // Keep this import
import { AbstractSocialClient } from '../AbstractSocialClient';
import { SocialShareContent, SocialShareResponse, SocialCredentials } from '@/types/social';

export class BlueskyClient extends AbstractSocialClient {
  private agent: BskyAgent;  // Now TypeScript knows what BskyAgent is

  constructor() {
    super();
    this.agent = new BskyAgent({ service: 'https://bsky.social' });
  }

  async authenticate(credentials: SocialCredentials): Promise<boolean> {
    try {
      if (!credentials.identifier || !credentials.password) {
        throw new Error('Identifier and password are required');
      }

      await this.agent.login({
        identifier: credentials.identifier,
        password: credentials.password,
      });
      
      this.authenticated = true;
      return true;
    } catch (error) {
      this.authenticated = false;
      throw error;
    }
  }

  async share(content: SocialShareContent): Promise<SocialShareResponse> {
    if (!this.isAuthenticated()) {
      return { success: false, error: 'Not authenticated' };
    }

    try {
      const post = await this.agent.post({
        text: content.text,
        createdAt: new Date().toISOString(),
      });

      if (!this.agent.session?.handle) {
        throw new Error('No active session');
      }

      const postId = post.uri.split('/').pop();
      const url = `https://bsky.app/profile/${this.agent.session.handle}/post/${postId}`;

      return {
        success: true,
        url,
        platformPostId: postId
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to share'
      };
    }
  }

  async logout(): Promise<void> {
    this.authenticated = false;
    await this.agent.logout();
  }
}