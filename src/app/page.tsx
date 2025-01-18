'use client';

import { usePathname } from 'next/navigation';
import Collections from '@/components/Collections';
import MarkdownCMS from '@/components/MarkdownCMS';

export default function Home() {
  const pathname = usePathname();

  // Show Collections page for /collections, otherwise show Topics (MarkdownCMS)
  if (pathname === '/collections') {
    return <Collections />;
  }

  // Default to Topics
  return <MarkdownCMS />;
}