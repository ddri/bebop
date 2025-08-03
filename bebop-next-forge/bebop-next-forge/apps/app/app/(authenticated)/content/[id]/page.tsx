import { auth } from '@repo/auth/server';
import { database } from '@repo/database';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ContentEditor } from './components/content-editor';

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const { userId } = await auth();

  if (!userId) {
    return { title: 'Content Not Found' };
  }

  const content = await database.content.findFirst({
    where: {
      id,
      campaign: {
        userId,
      },
    },
    select: { title: true, type: true },
  });

  if (!content) {
    return { title: 'Content Not Found' };
  }

  return {
    title: `${content.title} - Content Editor`,
    description: `Edit ${content.type.toLowerCase().replace('_', ' ')} content`,
  };
}

const ContentDetailPage = async ({ params }: Props) => {
  const { id } = await params;
  const { userId } = await auth();

  if (!userId) {
    notFound();
  }

  // Fetch content with related data
  const content = await database.content.findFirst({
    where: {
      id,
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
      schedules: {
        include: {
          destination: {
            select: {
              id: true,
              name: true,
              type: true,
            },
          },
        },
        orderBy: { publishAt: 'desc' },
      },
    },
  });

  if (!content) {
    notFound();
  }

  // Fetch user's campaigns for reassignment
  const campaigns = await database.campaign.findMany({
    where: { userId },
    select: {
      id: true,
      name: true,
      userId: true,
      description: true,
      status: true,
      startDate: true,
      endDate: true,
      goals: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: { name: 'asc' },
  });

  return <ContentEditor content={content} campaigns={campaigns} />;
};

export default ContentDetailPage;
