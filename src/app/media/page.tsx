'use client';

import dynamic from 'next/dynamic';
import Layout from '@/components/Layout';
import { PageLoading } from '@/components/ui/loading';

// Lazy load Media component
const Media = dynamic(() => import('@/components/Media'), {
  loading: () => <PageLoading message="Loading media library..." />
});

export default function MediaPage() {
  return (
    <Layout pathname="/media">
      <div className="container mx-auto p-8">
        <Media pathname="/media" />
      </div>
    </Layout>
  );
}