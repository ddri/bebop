'use client';

import { MarkdownCMS } from '@/components/MarkdownCMS';
import { usePathname } from 'next/navigation';
import Layout from '@/components/Layout';

export default function TopicsPage() {
  const pathname = usePathname();
  
  return (
    <Layout pathname={pathname}>
      <MarkdownCMS pathname={pathname} />
    </Layout>
  );
}