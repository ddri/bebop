'use client';

import { usePathname } from 'next/navigation';
import Layout from '@/components/Layout';
import WriteMode from '@/components/WriteMode';

export default function WritePage() {
  const pathname = usePathname();

  return (
    <Layout pathname={pathname}>
      <WriteMode />
    </Layout>
  );
}