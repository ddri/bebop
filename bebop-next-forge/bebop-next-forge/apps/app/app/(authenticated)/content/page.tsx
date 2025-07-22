import { auth } from '@repo/auth/server';
import { database } from '@repo/database';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ContentTable } from './components/content-table';
import { Header } from '../components/header';

const title = 'Content';
const description = 'Manage your content pieces';

export const metadata: Metadata = {
  title,
  description,
};

const ContentPage = async () => {
  const { userId } = await auth();

  if (!userId) {
    notFound();
  }

  const content = await database.content.findMany({
    where: {
      campaign: {
        userId,
      },
    },
    include: {
      campaign: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: {
      updatedAt: 'desc',
    },
  });

  return (
    <>
      <Header pages={['Content']} page="All Content" />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <ContentTable content={content} />
      </div>
    </>
  );
};

export default ContentPage;