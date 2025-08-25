import { AnalyticsDashboard } from '@/components/analytics/AnalyticsDashboard';

export default function AnalyticsPage() {
  return (
    <div className="container mx-auto p-6">
      <AnalyticsDashboard />
    </div>
  );
}

export const metadata = {
  title: 'Analytics - Bebop',
  description: 'Track your content performance and audience engagement',
};