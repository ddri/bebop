import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { Campaign } from '@/types/campaigns';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  subtext?: string;
}

const MetricCard = ({ icon: Icon, label, value, subtext }: MetricCardProps) => (
  <div className="p-4 bg-[#2f2f2d] rounded-lg">
    <div className="flex items-center gap-3 mb-2">
      <Icon className="w-5 h-5 text-[#E669E8]" />
      <span className="text-sm text-slate-400">{label}</span>
    </div>
    <div className="space-y-1">
      <div className="text-2xl font-semibold text-white">{value}</div>
      {subtext && <div className="text-xs text-slate-400">{subtext}</div>}
    </div>
  </div>
);

interface CampaignMetricsProps {
  campaign: Campaign;
}

const CampaignMetrics = ({ campaign }: CampaignMetricsProps) => {
  // Calculate metrics from campaign.publishingPlans
  const totalScheduled = campaign.publishingPlans.filter(pub => pub.status === 'scheduled').length;
  const totalPublished = campaign.publishingPlans.filter(pub => pub.status === 'published').length;
  const totalFailed = campaign.publishingPlans.filter(pub => pub.status === 'failed').length;
  
  
  // Calculate the next scheduled publication
  // const nextPublication = campaign.publishingPlans
  //   .filter(pub => pub.status === 'scheduled')
  //   .sort((a, b) => {
  //     const dateA = a.scheduledFor ? new Date(a.scheduledFor).getTime() : Infinity;
  //     const dateB = b.scheduledFor ? new Date(b.scheduledFor).getTime() : Infinity;
  //     return dateA - dateB;
  //   })[0];

  // Calculate campaign duration
  // const getDurationText = () => {
  //   if (!campaign.startDate) return 'Not set';
  //   const start = new Date(campaign.startDate);
  //   const end = campaign.endDate ? new Date(campaign.endDate) : new Date();
  //   const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  //   return `${days} days`;
  // };

  // const getDurationSubtext = () => {
  //   if (!campaign.startDate) return '';
  //   const start = new Date(campaign.startDate).toLocaleDateString();
  //   const end = campaign.endDate ? new Date(campaign.endDate).toLocaleDateString() : 'Ongoing';
  //   return `${start} - ${end}`;
  // };

   // Calculate completion rate
   const getCompletionRate = () => {
    const total = totalPublished + totalScheduled;
    if (total === 0) return '0.0';
    return ((totalPublished / total) * 100).toFixed(1);
  };

  return (
    <Card className="mb-8 bg-[#1c1c1e] border-0">
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <MetricCard
            icon={Clock}
            label="Queued Publications"
            value={totalScheduled}
            subtext={`${totalScheduled} items in queue`}
          />
          
          <MetricCard
            icon={CheckCircle}
            label="Published Content"
            value={totalPublished}
            subtext={`${getCompletionRate()}% completion rate`}
          />
          
          <MetricCard
            icon={AlertCircle}
            label="Failed Publications"
            value={totalFailed}
            subtext={totalFailed > 0 ? 'Click to view details' : 'No failed publications'}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default CampaignMetrics;