import { auth } from '@repo/auth/server';
import { database } from '@repo/database';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CampaignsTable } from './components/campaigns-table';
import { Header } from './components/header';

const title = 'Bebop CMS';
const description = 'Content Marketing Campaign Management';

export const metadata: Metadata = {
  title,
  description,
};

const App = async ({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) => {
  const { userId } = await auth();

  if (!userId) {
    notFound();
  }

  // Await searchParams for Next.js 15
  const params = await searchParams;

  // Build where clause based on status filter
  const whereClause: Record<string, unknown> = { userId };
  if (
    params.status &&
    ['DRAFT', 'ACTIVE', 'PAUSED', 'COMPLETED', 'ARCHIVED'].includes(
      params.status
    )
  ) {
    whereClause.status = params.status;
  }

  const campaigns = await database.campaign.findMany({
    where: whereClause,
    orderBy: {
      updatedAt: 'desc',
    },
  });

  // Determine page title based on filter
  const getPageTitle = () => {
    if (!params.status) {
      return 'All Campaigns';
    }
    return `${params.status.charAt(0) + params.status.slice(1).toLowerCase()} Campaigns`;
  };

  return (
    <>
      <Header pages={['Campaigns']} page={getPageTitle()} />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <CampaignsTable campaigns={campaigns} statusFilter={params.status} />
      </div>
    </>
  );
};

export default App;
