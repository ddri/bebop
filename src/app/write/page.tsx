'use client';

import { usePathname } from 'next/navigation';
import dynamic from 'next/dynamic';
import Layout from '@/components/Layout';
import { PageLoading } from '@/components/ui/loading';

// Lazy load WriteMode component with loading state
const WriteMode = dynamic(() => import('@/components/WriteMode'), {
  loading: () => <PageLoading message="Loading editor..." />
});

export default function WritePage() {
  const pathname = usePathname();

  return (
    <Layout pathname={pathname}>
      <WriteMode />
    </Layout>
  );
}