import { auth } from '@repo/auth/server';
import { database } from '@repo/database';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { DestinationsTable } from './components/destinations-table';
import { Header } from '../components/header';

const title = 'Destinations';
const description = 'Manage your publishing destinations';

export const metadata: Metadata = {
  title,
  description,
};

const DestinationsPage = async () => {
  const { userId } = await auth();

  if (!userId) {
    notFound();
  }

  const destinations = await database.destination.findMany({
    where: {
      userId,
    },
    orderBy: {
      name: 'asc',
    },
  });

  return (
    <>
      <Header pages={['Destinations']} page="Publishing Destinations" />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <DestinationsTable destinations={destinations} />
      </div>
    </>
  );
};

export default DestinationsPage;