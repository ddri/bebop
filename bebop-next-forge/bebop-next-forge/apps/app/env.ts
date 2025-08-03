import { keys as auth } from '@repo/auth/keys';
import { keys as database } from '@repo/database/keys';
import { keys as featureFlags } from '@repo/feature-flags/keys';
import { keys as nextConfig } from '@repo/next-config/keys';
import { keys as security } from '@repo/security/keys';
import { createEnv } from '@t3-oss/env-nextjs';

export const env = createEnv({
  extends: [auth(), database(), featureFlags(), nextConfig(), security()],
  server: {},
  client: {},
  runtimeEnv: {},
});
