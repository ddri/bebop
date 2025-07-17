// lib/social/AbstractSocialClient.ts
import { SocialCredentials, SocialShareContent, SocialShareResponse } from '@/types/social';

export abstract class AbstractSocialClient {
  protected authenticated = false;
  protected settings: Record<string, unknown> = {};
 
  abstract authenticate(credentials: SocialCredentials): Promise<boolean>;
  abstract share(content: SocialShareContent): Promise<SocialShareResponse>;
  abstract logout(): Promise<void>;
  
  isAuthenticated(): boolean {
    return this.authenticated;
  }

  getSettings(): Record<string, unknown> {
    return this.settings;
  }

  updateSettings(settings: Record<string, unknown>): void {
    this.settings = { ...this.settings, ...settings };
  }
}