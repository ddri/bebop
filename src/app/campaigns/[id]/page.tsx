'use client';;
import { use } from "react";

import { usePathname } from 'next/navigation';
import CampaignPlanner from '@/components/CampaignPlanner';

export default function CampaignPlannerPage(props: { params: Promise<{ id: string }> }) {
  const params = use(props.params);
  const pathname = usePathname();

  return <CampaignPlanner campaignId={params.id} pathname={pathname} />;
}