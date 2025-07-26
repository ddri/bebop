import { auth } from '@repo/auth/server';
import { database } from '@repo/database';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { CalendarView } from './components/calendar-view';
import { Header } from '../../components/header';
import { Button } from '@repo/design-system/components/ui/button';
import { Calendar, List } from 'lucide-react';

const title = 'Calendar';
const description = 'Visual calendar view of your content publishing schedule';

export const metadata: Metadata = {
  title,
  description,
};

const CalendarPage = async () => {
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
          body: true,
          excerpt: true,
          type: true,
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
    orderBy: {
      publishAt: 'asc',
    },
  });

  // Get available destinations for scheduling
  const destinations = await database.destination.findMany({
    where: {
      userId,
    },
    select: {
      id: true,
      name: true,
      type: true,
    },
  });

  // Get available campaigns
  const campaigns = await database.campaign.findMany({
    where: {
      userId,
    },
    select: {
      id: true,
      name: true,
      status: true,
    },
  });

  return (
    <>
      <Header pages={['Schedule', 'Calendar']} page="Content Calendar" />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        {/* View Toggle */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold">Calendar View</h2>
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
        
        <CalendarView 
          schedules={schedules}
          destinations={destinations}
          campaigns={campaigns}
        />
      </div>
    </>
  );
};

export default CalendarPage;