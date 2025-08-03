import { auth } from '@repo/auth/server';
import { database } from '@repo/database';
import { ScheduleStatus } from '@repo/database/types';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Header } from '../components/header';
import { ScheduledContentTable } from './components/scheduled-content-table';

const title = 'Scheduled Content';
const description = 'View and manage all scheduled content across campaigns';

export const metadata: Metadata = {
  title,
  description,
};

type SearchParams = Promise<{
  status?: string;
  campaign?: string;
  destination?: string;
}>;

const ScheduledContentPage = async (props: { searchParams: SearchParams }) => {
  const { userId } = await auth();
  const searchParams = await props.searchParams;

  if (!userId) {
    notFound();
  }

  // Build where clause based on search params
  const whereClause: {
    campaign: { userId: string };
    status?: ScheduleStatus;
    campaignId?: string;
    destinationId?: string;
  } = {
    campaign: {
      userId,
    },
  };

  if (
    searchParams.status &&
    Object.values(ScheduleStatus).includes(
      searchParams.status as ScheduleStatus
    )
  ) {
    whereClause.status = searchParams.status as ScheduleStatus;
  }

  if (searchParams.campaign) {
    whereClause.campaignId = searchParams.campaign;
  }

  if (searchParams.destination) {
    whereClause.destinationId = searchParams.destination;
  }

  // Fetch all scheduled content with related data
  const schedules = await database.schedule.findMany({
    where: whereClause,
    include: {
      content: {
        select: {
          id: true,
          title: true,
          type: true,
          excerpt: true,
        },
      },
      campaign: {
        select: {
          id: true,
          name: true,
          status: true,
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
    orderBy: [
      { status: 'asc' }, // PENDING first, then others
      { publishAt: 'asc' },
    ],
  });

  // Get filter options
  const [campaigns, destinations] = await Promise.all([
    database.campaign.findMany({
      where: { userId },
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    }),
    database.destination.findMany({
      where: { userId },
      select: { id: true, name: true, type: true },
      orderBy: { name: 'asc' },
    }),
  ]);

  return (
    <div className="flex h-full flex-col">
      <Header pages={[]} page="Scheduled Content" />
      <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
        <ScheduledContentTable
          schedules={schedules}
          campaigns={campaigns}
          destinations={destinations}
          filters={{
            status: searchParams.status,
            campaign: searchParams.campaign,
            destination: searchParams.destination,
          }}
        />
      </div>
    </div>
  );
};

export default ScheduledContentPage;
