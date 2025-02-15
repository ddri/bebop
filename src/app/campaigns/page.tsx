'use client';

import { usePathname } from 'next/navigation';
import Campaigns from '@/components/Campaigns';

export default function CampaignsPage() {
  const pathname = usePathname();
  
  return <Campaigns pathname={pathname} />;
}