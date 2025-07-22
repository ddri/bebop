import { auth } from '@repo/auth/server';
import { database } from '@repo/database';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ScheduleTable } from './components/schedule-table';
import { Header } from '../components/header';

const title = 'Schedule';
const description = 'Manage your content publishing schedule';

export const metadata: Metadata = {
  title,
  description,
};

const SchedulePage = async () => {
  const { userId } = await auth();

  if (!userId) {
    notFound();
  }

  const schedules = await database.schedule.findMany({
    where: {
      campaign: {
        userId,
      },
    },
    include: {
      content: {
        select: {
          id: true,
          title: true,
          type: true,
        },
      },
      campaign: {
        select: {
          id: true,
          name: true,
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
    orderBy: {
      publishAt: 'asc',
    },
  });

  return (
    <>
      <Header pages={['Schedule']} page="Content Calendar" />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <ScheduleTable schedules={schedules} />
      </div>
    </>
  );
};

export default SchedulePage;