import { auth } from '@repo/auth/server';
import { database } from '@repo/database';
import { notFound, redirect } from 'next/navigation';
import { Header } from '../components/header';

type SearchPageProperties = {
  searchParams: Promise<{
    q: string;
  }>;
};

export const generateMetadata = async ({
  searchParams,
}: SearchPageProperties) => {
  const { q } = await searchParams;

  return {
    title: `${q} - Search results`,
    description: `Search results for ${q}`,
  };
};

const SearchPage = async ({ searchParams }: SearchPageProperties) => {
  const { q } = await searchParams;
  const { userId } = await auth();

  if (!userId) {
    notFound();
  }

  if (!q) {
    redirect('/');
  }

  // Search for campaigns and content
  const [campaigns, content] = await Promise.all([
    database.campaign.findMany({
      where: {
        userId,
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { description: { contains: q, mode: 'insensitive' } },
        ],
      },
      take: 10,
    }),
    database.content.findMany({
      where: {
        campaign: { userId },
        OR: [
          { title: { contains: q, mode: 'insensitive' } },
          { body: { contains: q, mode: 'insensitive' } },
        ],
      },
      include: {
        campaign: true,
      },
      take: 10,
    }),
  ]);

  return (
    <>
      <Header pages={['Search']} page={`Search results for "${q}"`} />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        {campaigns.length > 0 && (
          <div>
            <h2 className="mb-4 font-semibold text-lg">Campaigns</h2>
            <div className="grid auto-rows-min gap-4 md:grid-cols-3">
              {campaigns.map((campaign) => (
                <div
                  key={campaign.id}
                  className="aspect-video rounded-xl bg-muted/50 p-4"
                >
                  <h3 className="font-medium">{campaign.name}</h3>
                  <p className="mt-2 text-muted-foreground text-sm">
                    {campaign.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {content.length > 0 && (
          <div>
            <h2 className="mb-4 font-semibold text-lg">Content</h2>
            <div className="grid auto-rows-min gap-4 md:grid-cols-3">
              {content.map((item) => (
                <div
                  key={item.id}
                  className="aspect-video rounded-xl bg-muted/50 p-4"
                >
                  <h3 className="font-medium">{item.title}</h3>
                  <p className="mt-1 text-muted-foreground text-sm">
                    {item.campaign.name}
                  </p>
                  <p className="mt-2 line-clamp-2 text-muted-foreground text-xs">
                    {item.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {campaigns.length === 0 && content.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-muted-foreground">
              No results found for &quot;{q}&quot;
            </p>
          </div>
        )}
      </div>
    </>
  );
};

export default SearchPage;
