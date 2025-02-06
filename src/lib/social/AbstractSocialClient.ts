// lib/social/AbstractSocialClient.ts
import { SocialCredentials, SocialShareContent, SocialShareResponse } from '@/types/social';

export abstract class AbstractSocialClient {
  protected authenticated = false;
  protected settings: Record<string, any> = {};
 
  abstract authenticate(credentials: SocialCredentials): Promise<boolean>;
  abstract share(content: SocialShareContent): Promise<SocialShareResponse>;
  abstract logout(): Promise<void>;
  
  isAuthenticated(): boolean {
    return this.authenticated;
  }

  getSettings(): Record<string, any> {
    return this.settings;
  }

  updateSettings(settings: Record<string, any>): void {
    this.settings = { ...this.settings, ...settings };
  }
}