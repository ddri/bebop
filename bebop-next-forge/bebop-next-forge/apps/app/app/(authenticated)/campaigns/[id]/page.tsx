import { auth } from '@repo/auth/server';
import { database } from '@repo/database';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CampaignWorkspace } from './components/campaign-workspace';

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const { userId } = await auth();

  if (!userId) {
    return { title: 'Campaign Not Found' };
  }

  const campaign = await database.campaign.findFirst({
    where: { id, userId },
    select: { name: true, description: true },
  });

  if (!campaign) {
    return { title: 'Campaign Not Found' };
  }

  return {
    title: `${campaign.name} - Campaign Workspace`,
    description: campaign.description || `Manage content and scheduling for ${campaign.name}`,
  };
}

const CampaignWorkspacePage = async ({ params }: Props) => {
  const { id } = await params;
  const { userId } = await auth();

  if (!userId) {
    notFound();
  }

  // Fetch campaign with all related data
  const campaign = await database.campaign.findFirst({
    where: { id, userId },
    include: {
      content: {
        orderBy: { createdAt: 'desc' },
      },
      schedules: {
        include: {
          content: {
            select: {
              id: true,
              title: true,
              type: true,
            },
          },
          destination: {
            select: {
              id: true,
              name: true,
              type: true,
            },
          },
        },
        orderBy: { publishAt: 'asc' },
      },
    },
  });

  if (!campaign) {
    notFound();
  }

  // Fetch user's destinations for scheduling
  const destinations = await database.destination.findMany({
    where: { userId, isActive: true },
    orderBy: { name: 'asc' },
  });

  return (
    <CampaignWorkspace 
      campaign={campaign} 
      destinations={destinations}
    />
  );
};

export default CampaignWorkspacePage;