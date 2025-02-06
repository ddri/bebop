// components/social/ShareMetrics.tsx
import { SocialShareMetrics } from '@/types/social';
import { Share } from 'lucide-react';

export function ShareMetrics({ metrics }: { metrics: SocialShareMetrics[] }) {
  const totalShares = metrics.reduce((sum, m) => sum + m.shareCount, 0);
  const successRate = metrics.reduce((sum, m) => sum + m.successCount, 0) / totalShares * 100;

  if (totalShares === 0) return null;

  return (
    <div className="flex items-center gap-2 text-sm text-slate-500">
      <Share className="h-4 w-4" />
      <span>{totalShares} shares</span>
      {successRate > 0 && (
        <span className="text-green-500">({successRate.toFixed(0)}% success)</span>
      )}
    </div>
  );
}