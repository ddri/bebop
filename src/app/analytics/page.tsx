'use client';

import Layout from '@/components/Layout';
import { AnalyticsDashboard } from '@/components/analytics/AnalyticsDashboard';

export default function AnalyticsPage() {
  return (
    <Layout pathname="/analytics">
      <div className="container mx-auto p-6">
        <AnalyticsDashboard />
      </div>
    </Layout>
  );
}