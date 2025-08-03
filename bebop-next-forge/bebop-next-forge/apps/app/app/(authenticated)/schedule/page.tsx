import { auth } from '@repo/auth/server';
import { database } from '@repo/database';
import { Button } from '@repo/design-system/components/ui/button';
import { Calendar, List } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Header } from '../components/header';
import { ScheduleTable } from './components/schedule-table';

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
        {/* View Toggle */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="font-semibold text-lg">Schedule</h2>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href="/schedule" className="gap-2">
                <List className="h-4 w-4" />
                List View
              </Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/schedule/calendar" className="gap-2">
                <Calendar className="h-4 w-4" />
                Calendar View
              </Link>
            </Button>
          </div>
        </div>

        <ScheduleTable schedules={schedules} />
      </div>
    </>
  );
};

export default SchedulePage;
