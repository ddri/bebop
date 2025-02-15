'use client';

import { usePathname } from 'next/navigation';
import CampaignPlanner from '@/components/CampaignPlanner';

export default function CampaignPlannerPage({ params }: { params: { id: string } }) {
  const pathname = usePathname();
  
  return <CampaignPlanner campaignId={params.id} pathname={pathname} />;
}