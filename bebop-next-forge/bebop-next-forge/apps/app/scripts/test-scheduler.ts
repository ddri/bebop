#!/usr/bin/env tsx

/**
 * Quick Test Script for Publishing Queue System
 *
 * This script:
 * 1. Creates test data (campaign, content, destination, schedule)
 * 2. Schedules a post for immediate publication
 * 3. Watches the scheduler process it
 * 4. Reports the results
 */

import { database } from '@repo/database';
import {
  CampaignStatus,
  ContentStatus,
  ContentType,
  DestinationType,
  ScheduleStatus,
} from '@repo/database/types';

async function createTestData() {
  // Create test campaign
  const campaign = await database.campaign.create({
    data: {
      userId: 'test-user-id',
      name: 'Test Campaign for Scheduler',
      description: 'Automated test campaign',
      status: CampaignStatus.ACTIVE,
    },
  });

  // Create test content
  const content = await database.content.create({
    data: {
      campaignId: campaign.id,
      title: 'Test Post for Scheduler',
      body: `This is a test post created at ${new Date().toISOString()}. 

#testing #scheduler #automation

This post should be published automatically by our queue system!`,
      excerpt:
        'A test post to verify our publishing queue system works correctly.',
      type: ContentType.BLOG_POST,
      status: ContentStatus.READY,
    },
  });

  // Create test destination (Hashnode with dummy credentials)
  const destination = await database.destination.create({
    data: {
      userId: 'test-user-id',
      name: 'Test Hashnode Blog',
      type: DestinationType.HASHNODE,
      config: {
        apiKey: 'test-api-key-123',
        publicationId: 'test-publication-id',
        enableTableOfContents: true,
      },
      isActive: true,
    },
  });

  // Create schedule for immediate publication (30 seconds from now)
  const publishAt = new Date(Date.now() + 30 * 1000);
  const schedule = await database.schedule.create({
    data: {
      campaignId: campaign.id,
      contentId: content.id,
      destinationId: destination.id,
      publishAt,
      status: ScheduleStatus.PENDING,
      attempts: 0,
    },
  });

  return { campaign, content, destination, schedule };
}

async function watchSchedule(scheduleId: string, maxWaitMinutes = 5) {
  const startTime = Date.now();
  const maxWaitMs = maxWaitMinutes * 60 * 1000;
  let lastStatus = '';

  while (Date.now() - startTime < maxWaitMs) {
    const schedule = await database.schedule.findUnique({
      where: { id: scheduleId },
      include: {
        content: { select: { title: true } },
        destination: { select: { name: true, type: true } },
      },
    });

    if (!schedule) {
      return;
    }

    // Only log status changes
    if (schedule.status !== lastStatus) {
      const _timestamp = new Date().toISOString();

      if (schedule.attempts > 0) {
      }

      if (schedule.error) {
      }

      if (schedule.publishedAt) {
      }

      lastStatus = schedule.status;
    }

    // Check if we're done
    if (schedule.status === ScheduleStatus.PUBLISHED) {
      return { success: true, schedule };
    }

    if (schedule.status === ScheduleStatus.FAILED) {
      return { success: false, schedule };
    }

    // Wait 10 seconds before checking again
    await new Promise((resolve) => setTimeout(resolve, 10000));
  }
  return { success: false, timeout: true };
}

async function triggerSchedulerCheck() {
  try {
    const response = await fetch('http://localhost:3007/api/scheduler', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'checkPending' }),
    });

    if (response.ok) {
    } else {
    }
  } catch (_error) {}
}

async function cleanup(ids: {
  campaignId: string;
  scheduleId: string;
  contentId: string;
  destinationId: string;
}) {
  try {
    await database.schedule.delete({ where: { id: ids.scheduleId } });
    await database.content.delete({ where: { id: ids.contentId } });
    await database.destination.delete({ where: { id: ids.destinationId } });
    await database.campaign.delete({ where: { id: ids.campaignId } });
  } catch (_error) {}
}

async function main() {
  try {
    // Step 1: Create test data
    const { campaign, content, destination, schedule } = await createTestData();

    // Step 2: Trigger scheduler check
    await triggerSchedulerCheck();

    const result = await watchSchedule(schedule.id);

    if (result?.success) {
    } else if (result?.timeout) {
    } else {
    }

    // Step 5: Cleanup
    await cleanup({
      campaignId: campaign.id,
      scheduleId: schedule.id,
      contentId: content.id,
      destinationId: destination.id,
    });
  } catch (_error) {
    process.exit(1);
  }
  process.exit(0);
}

// Handle cleanup on exit
process.on('SIGINT', async () => {
  process.exit(0);
});

// Run the test
main().catch(console.error);
