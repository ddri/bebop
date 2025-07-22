import { auth } from '@repo/auth/server';
import { database } from '@repo/database';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { AnalyticsDashboard } from './components/analytics-dashboard';
import { Header } from '../components/header';

const title = 'Analytics';
const description = 'Track your content marketing performance';

export const metadata: Metadata = {
  title,
  description,
};

const AnalyticsPage = async () => {
  const { userId } = await auth();

  if (!userId) {
    notFound();
  }

  // Get overview stats
  const [campaigns, content, schedules, destinations] = await Promise.all([
    database.campaign.findMany({
      where: { userId },
      include: {
        content: true,
        schedules: true,
      },
    }),
    database.content.findMany({
      where: {
        campaign: { userId },
      },
      include: {
        campaign: { select: { name: true } },
      },
    }),
    database.schedule.findMany({
      where: {
        campaign: { userId },
      },
      include: {
        content: { select: { title: true, type: true } },
        destination: { select: { name: true, type: true } },
      },
    }),
    database.destination.findMany({
      where: { userId },
    }),
  ]);

  // Calculate stats
  const stats = {
    totalCampaigns: campaigns.length,
    activeCampaigns: campaigns.filter(c => c.status === 'ACTIVE').length,
    totalContent: content.length,
    publishedContent: content.filter(c => c.status === 'PUBLISHED').length,
    totalSchedules: schedules.length,
    publishedSchedules: schedules.filter(s => s.status === 'PUBLISHED').length,
    activeDestinations: destinations.filter(d => d.isActive).length,
    
    // Content by type
    contentByType: content.reduce((acc, c) => {
      acc[c.type] = (acc[c.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    
    // Campaigns by status
    campaignsByStatus: campaigns.reduce((acc, c) => {
      acc[c.status] = (acc[c.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    
    // Recent activity
    recentContent: content
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5),
    
    recentSchedules: schedules
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5),
  };

  return (
    <>
      <Header pages={['Analytics']} page="Dashboard" />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <AnalyticsDashboard stats={stats} />
      </div>
    </>
  );
};

export default AnalyticsPage;