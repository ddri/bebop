#!/usr/bin/env tsx

// Mock server-only module to allow script execution
const Module = require('node:module');
const originalRequire = Module.prototype.require;
Module.prototype.require = function (id: string) {
  if (id === 'server-only') {
    return {}; // Mock empty object
  }
  return originalRequire.apply(this, arguments);
};

import { database } from '@repo/database';
import {
  CampaignStatus,
  ContentStatus,
  ContentType,
  DestinationType,
  ScheduleStatus,
} from '@repo/database/types';

/**
 * Creates test scenarios to verify scheduler retry logic and failure handling
 */
async function createFailureTestScenarios() {
  const testUserId = 'test_failure_scheduler';
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

  // Create test campaign
  const campaign = await database.campaign.create({
    data: {
      userId: testUserId,
      name: 'Failure Test Campaign',
      description: 'Testing retry logic and failure scenarios',
      status: CampaignStatus.ACTIVE,
    },
  });
  const destinations = await Promise.all([
    database.destination.create({
      data: {
        userId: testUserId,
        name: 'Broken Hashnode Config',
        type: DestinationType.HASHNODE,
        config: {
          publicationId: 'invalid-publication-id',
          apiToken: 'invalid-token-should-fail',
        },
        isActive: true,
      },
    }),
    database.destination.create({
      data: {
        userId: testUserId,
        name: 'Broken Dev.to Config',
        type: DestinationType.DEVTO,
        config: {
          apiKey: 'invalid-dev-to-key',
        },
        isActive: true,
      },
    }),
  ]);
  const content = await Promise.all([
    database.content.create({
      data: {
        campaignId: campaign.id,
        title: 'Retry Test Content - Should Fail 3 Times',
        body: 'This content is designed to fail publishing and test the retry mechanism. #retry #testing #failure',
        excerpt: 'Testing retry logic with intentional failures',
        type: ContentType.BLOG_POST,
        status: ContentStatus.READY,
      },
    }),
    database.content.create({
      data: {
        campaignId: campaign.id,
        title: 'Another Failure Test',
        body: 'Another piece of content to test multiple failure scenarios. #fail #test',
        excerpt: 'Multiple failure testing',
        type: ContentType.SOCIAL_POST,
        status: ContentStatus.READY,
      },
    }),
  ]);
  const now = new Date();
  const schedules = await Promise.all([
    // Schedule 1: Should fail immediately and retry 3 times
    database.schedule.create({
      data: {
        contentId: content[0].id,
        campaignId: campaign.id,
        destinationId: destinations[0].id, // Broken Hashnode
        publishAt: new Date(now.getTime() - 1000), // 1 second ago
        status: ScheduleStatus.PENDING,
      },
    }),
    // Schedule 2: Should also fail and retry
    database.schedule.create({
      data: {
        contentId: content[1].id,
        campaignId: campaign.id,
        destinationId: destinations[1].id, // Broken Dev.to
        publishAt: new Date(now.getTime() - 1000), // 1 second ago
        status: ScheduleStatus.PENDING,
      },
    }),
    // Schedule 3: Manually set to failed status with 2 attempts to test retry API
    database.schedule.create({
      data: {
        contentId: content[0].id,
        campaignId: campaign.id,
        destinationId: destinations[0].id,
        publishAt: new Date(now.getTime() - 60000), // 1 minute ago
        status: ScheduleStatus.FAILED,
        attempts: 2,
        error: 'Previous test failure',
      },
    }),
  ]);

  return {
    campaignId: campaign.id,
    destinationIds: destinations.map((d) => d.id),
    contentIds: content.map((c) => c.id),
    scheduleIds: schedules.map((s) => s.id),
    failedScheduleId: schedules[2].id, // For manual retry testing
  };
}

async function monitorFailureTests() {
  const schedules = await database.schedule.findMany({
    where: {
      campaign: {
        userId: 'test_failure_scheduler',
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
      createdAt: 'desc',
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

    if (schedule.lastAttemptAt) {
      const lastAttempt = new Date(schedule.lastAttemptAt);
      const _minutesSinceAttempt = Math.round(
        (Date.now() - lastAttempt.getTime()) / (60 * 1000)
      );
    }
  });

  // Show summary stats
  const stats = schedules.reduce(
    (acc, s) => {
      acc[s.status] = (acc[s.status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );
  Object.entries(stats).forEach(([_status, _count]) => {});
}

async function testManualRetry(scheduleId: string) {
  try {
    const response = await fetch('http://localhost:3000/api/scheduler', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'retry',
        scheduleId,
      }),
    });

    const _result = await response.json();

    if (response.ok) {
    } else {
    }
  } catch (_error) {}
}

// Main execution
async function main() {
  const command = process.argv[2];

  try {
    switch (command) {
      case 'create': {
        const _testData = await createFailureTestScenarios();
        break;
      }

      case 'monitor':
        await monitorFailureTests();
        break;

      case 'retry': {
        const scheduleId = process.argv[3];
        if (!scheduleId) {
          process.exit(1);
        }
        await testManualRetry(scheduleId);
        break;
      }

      default: {
      }
    }
  } catch (_error) {
    process.exit(1);
  } finally {
    await database.$disconnect();
  }
}

if (import.meta.url.endsWith(process.argv[1])) {
  main();
}

export { createFailureTestScenarios, monitorFailureTests, testManualRetry };
