'use client';

import { use } from "react";
import { usePathname } from 'next/navigation';
import CampaignOrchestrationDashboard from '@/components/campaign/CampaignOrchestrationDashboard';

export default function CampaignOrchestrationPage(props: { params: Promise<{ id: string }> }) {
  const params = use(props.params);
  const pathname = usePathname();

  return <CampaignOrchestrationDashboard campaignId={params.id} pathname={pathname} />;
}