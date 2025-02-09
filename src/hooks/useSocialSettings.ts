// hooks/useSocialSettings.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { SocialSettings, PlatformId, SocialCredentials } from '@/types/social';

interface SocialSettingsStore {
  credentials: Partial<Record<PlatformId, SocialCredentials>>;
  preferences: Partial<Record<PlatformId, {
    autoShare?: boolean;
    instanceUrl?: string;
  }>>;
  setCredentials: (platform: PlatformId, credentials: SocialCredentials) => void;
  clearCredentials: (platform: PlatformId) => void;
  updatePreferences: (platform: PlatformId, preferences: Record<string, any>) => void;
}

export const useSocialSettings = create<SocialSettingsStore>()(
  persist(
    (set) => ({
      credentials: {} as Partial<Record<PlatformId, SocialCredentials>>,
      preferences: {} as Partial<Record<PlatformId, {
        autoShare?: boolean;
        instanceUrl?: string;
      }>>,
      setCredentials: (platform, credentials) =>
        set((state) => ({
          credentials: {
            ...state.credentials,
            [platform]: credentials
          }
        })),
      clearCredentials: (platform) =>
        set((state) => {
          const { [platform]: _, ...rest } = state.credentials;
          return { credentials: rest };
        }),
      updatePreferences: (platform, preferences) =>
        set((state) => ({
          preferences: {
            ...state.preferences,
            [platform]: {
              ...state.preferences[platform],
              ...preferences
            }
          }
        }))
    }),
    {
      name: 'bebop-social-settings',
    }
  )
);