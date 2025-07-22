import type { ReactNode } from 'react';
import { GoogleAnalytics } from './google';
import { keys } from './keys';
import { VercelAnalytics } from './vercel';

type AnalyticsProviderProps = {
  readonly children: ReactNode;
};

const { NEXT_PUBLIC_GA_MEASUREMENT_ID } = keys();

export const AnalyticsProvider = ({ children }: AnalyticsProviderProps) => (
  <>
    {children}
    <VercelAnalytics />
    {NEXT_PUBLIC_GA_MEASUREMENT_ID && (
      <GoogleAnalytics gaId={NEXT_PUBLIC_GA_MEASUREMENT_ID} />
    )}
  </>
);
