'use client';;
import { use } from "react";

import { usePathname } from 'next/navigation';
import SimplifiedCampaignDetail from '@/components/SimplifiedCampaignDetail';

export default function CampaignDetailPage(props: { params: Promise<{ id: string }> }) {
  const params = use(props.params);
  const pathname = usePathname();

  return <SimplifiedCampaignDetail campaignId={params.id} pathname={pathname} />;
}