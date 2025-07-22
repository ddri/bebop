import { auth } from '@repo/auth/server';
import { flag } from 'flags/next';

export const createFlag = (key: string) =>
  flag({
    key,
    defaultValue: false,
    async decide() {
      const { userId } = await auth();

      if (!userId) {
        return this.defaultValue as boolean;
      }

      // Simple feature flag logic - can be enhanced later
      // For now, just return the default value
      return this.defaultValue as boolean;
    },
  });
