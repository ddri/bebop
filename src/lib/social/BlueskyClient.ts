// lib/social/BlueskyClient.ts
import { BskyAgent } from '@atproto/api';
import { AbstractSocialClient } from './AbstractSocialClient';
import { SocialShareContent, SocialShareResponse } from '@/types/social';

export class BlueskyClient extends AbstractSocialClient {
  private agent: BskyAgent;
  // private authenticated = false;

  constructor() {
    super();
    this.agent = new BskyAgent({ service: 'https://bsky.social' });
  }

  async authenticate(credentials: { identifier: string; password: string }): Promise<boolean> {
    try {
      await this.agent.login(credentials);
      this.authenticated = true;
      return true;
    } catch (error) {
      this.authenticated = false;
      throw error;
    }
  }

  async share(content: SocialShareContent): Promise<SocialShareResponse> {
    if (!this.authenticated) {
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
      
      return {
        success: true,
        url: `https://bsky.app/profile/${this.agent.session.handle}/post/${postId}`,
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
    try {
      await this.agent.logout();
    } finally {
      this.authenticated = false;
    }
  }
}