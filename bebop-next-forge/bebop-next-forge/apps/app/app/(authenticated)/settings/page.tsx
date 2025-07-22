import { auth } from '@repo/auth/server';
import { database } from '@repo/database';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SettingsLayout } from './components/settings-layout';
import { Header } from '../components/header';

const title = 'Settings';
const description = 'Manage your account and preferences';

export const metadata: Metadata = {
  title,
  description,
};

const SettingsPage = async () => {
  const { userId } = await auth();

  if (!userId) {
    notFound();
  }

  // Get user's destinations for API key management
  const destinations = await database.destination.findMany({
    where: { userId },
    orderBy: { name: 'asc' },
  });

  return (
    <>
      <Header pages={['Settings']} page="Account Settings" />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <SettingsLayout destinations={destinations} />
      </div>
    </>
  );
};

export default SettingsPage;