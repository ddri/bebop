#!/usr/bin/env tsx

import { database } from '@repo/database';
import {
  CampaignStatus,
  ContentStatus,
  ContentType,
  DestinationType,
  ScheduleStatus,
} from '@repo/database/types';

async function createTestData() {
  // Create a test user ID (in real app, this would come from auth)
  const testUserId = 'test_scheduler_user';
  await database.schedule.deleteMany({
    where: {
      campaign: {
        userId: testUserId,
      },
    },
  });
  await database.content.deleteMany({
    where: {
      campaign: {
        userId: testUserId,
      },
    },
  });
  await database.destination.deleteMany({
    where: {
      userId: testUserId,
    },
  });
  await database.campaign.deleteMany({
    where: {
      userId: testUserId,
    },
  });
  const campaign = await database.campaign.create({
    data: {
      userId: testUserId,
      name: 'Scheduler Test Campaign',
      description: 'Testing the publishing queue system',
      status: CampaignStatus.ACTIVE,
    },
  });
  const destinations = await Promise.all([
    database.destination.create({
      data: {
        userId: testUserId,
        name: 'Test Hashnode Blog',
        type: DestinationType.HASHNODE,
        config: {
          publicationId: 'test-publication',
          apiToken: 'test-token',
        },
        isActive: true,
      },
    }),
    database.destination.create({
      data: {
        userId: testUserId,
        name: 'Test Dev.to Profile',
        type: DestinationType.DEVTO,
        config: {
          apiKey: 'test-api-key',
        },
        isActive: true,
      },
    }),
    database.destination.create({
      data: {
        userId: testUserId,
        name: 'Test Bluesky Account',
        type: DestinationType.BLUESKY,
        config: {
          identifier: 'test.bsky.social',
          password: 'test-password',
        },
        isActive: true,
      },
    }),
    database.destination.create({
      data: {
        userId: testUserId,
        name: 'Test Mastodon Account',
        type: DestinationType.MASTODON,
        config: {
          instanceUrl: 'https://mastodon.social',
          accessToken: 'test-access-token',
        },
        isActive: true,
      },
    }),
  ]);

  destinations.forEach((_dest, _i) => {});
  const content = await Promise.all([
    database.content.create({
      data: {
        campaignId: campaign.id,
        title: 'Immediate Publish Test',
        body: 'This content should be published immediately. Testing the scheduler with #testing #automation',
        excerpt: 'Testing immediate publishing',
        type: ContentType.BLOG_POST,
        status: ContentStatus.READY,
      },
    }),
    database.content.create({
      data: {
        campaignId: campaign.id,
        title: 'Future Publish Test',
        body: 'This content is scheduled for future publishing. #scheduled #future',
        excerpt: 'Testing future scheduling',
        type: ContentType.SOCIAL_POST,
        status: ContentStatus.READY,
      },
    }),
    database.content.create({
      data: {
        campaignId: campaign.id,
        title: 'Retry Logic Test',
        body: 'This content will be forced to fail for retry testing. #retry #testing',
        excerpt: 'Testing retry logic',
        type: ContentType.SOCIAL_POST,
        status: ContentStatus.READY,
      },
    }),
  ]);

  content.forEach((_item, _i) => {});

  const now = new Date();
  const in1Minute = new Date(now.getTime() + 1 * 60 * 1000);
  const in5Minutes = new Date(now.getTime() + 5 * 60 * 1000);
  const in10Minutes = new Date(now.getTime() + 10 * 60 * 1000);

  const schedules = await Promise.all([
    // Immediate publishing - should publish right away
    database.schedule.create({
      data: {
        contentId: content[0].id,
        campaignId: campaign.id,
        destinationId: destinations[0].id, // Hashnode
        publishAt: new Date(now.getTime() - 1000), // 1 second ago
        status: ScheduleStatus.PENDING,
      },
    }),
    database.schedule.create({
      data: {
        contentId: content[0].id,
        campaignId: campaign.id,
        destinationId: destinations[1].id, // Dev.to
        publishAt: new Date(now.getTime() - 1000), // 1 second ago
        status: ScheduleStatus.PENDING,
      },
    }),

    // Future publishing - should wait
    database.schedule.create({
      data: {
        contentId: content[1].id,
        campaignId: campaign.id,
        destinationId: destinations[2].id, // Bluesky
        publishAt: in5Minutes,
        status: ScheduleStatus.PENDING,
      },
    }),
    database.schedule.create({
      data: {
        contentId: content[1].id,
        campaignId: campaign.id,
        destinationId: destinations[3].id, // Mastodon
        publishAt: in10Minutes,
        status: ScheduleStatus.PENDING,
      },
    }),

    // Retry test - schedule for 1 minute from now
    database.schedule.create({
      data: {
        contentId: content[2].id,
        campaignId: campaign.id,
        destinationId: destinations[0].id, // Hashnode
        publishAt: in1Minute,
        status: ScheduleStatus.PENDING,
      },
    }),
  ]);
  schedules.forEach((sched, _i) => {
    const _dest = destinations.find((d) => d.id === sched.destinationId);
    const _contentItem = content.find((c) => c.id === sched.contentId);
  });

  return {
    campaignId: campaign.id,
    destinationIds: destinations.map((d) => d.id),
    contentIds: content.map((c) => c.id),
    scheduleIds: schedules.map((s) => s.id),
  };
}

async function monitorSchedules() {
  const schedules = await database.schedule.findMany({
    where: {
      campaign: {
        userId: 'test_scheduler_user',
      },
    },
    include: {
      content: {
        select: {
          title: true,
        },
      },
      destination: {
        select: {
          name: true,
          type: true,
        },
      },
    },
    orderBy: {
      publishAt: 'asc',
    },
  });

  schedules.forEach((schedule, _i) => {
    const timeUntil = schedule.publishAt.getTime() - Date.now();
    const _timeStr =
      timeUntil > 0
        ? `in ${Math.round(timeUntil / (60 * 1000))} minutes`
        : `${Math.round(Math.abs(timeUntil) / (60 * 1000))} minutes ago`;
    if (schedule.error) {
    }
    if (schedule.attempts > 0) {
    }
  });
}

// Main execution
async function main() {
  try {
    const _testData = await createTestData();

    // Monitor initial state
    await monitorSchedules();
  } catch (_error) {
    process.exit(1);
  } finally {
    await database.$disconnect();
  }
}

if (import.meta.url.endsWith(process.argv[1])) {
  main();
}

export { createTestData, monitorSchedules };
