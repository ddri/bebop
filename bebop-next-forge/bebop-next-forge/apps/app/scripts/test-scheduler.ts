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
  console.log('🔧 Creating test data...');

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

  console.log(`✅ Test data created:`);
  console.log(`   Campaign: ${campaign.name} (${campaign.id})`);
  console.log(`   Content: ${content.title}`);
  console.log(`   Destination: ${destination.name} (${destination.type})`);
  console.log(
    `   Schedule: ${schedule.id} (due at ${publishAt.toISOString()})`
  );
  console.log('');

  return { campaign, content, destination, schedule };
}

async function watchSchedule(scheduleId: string, maxWaitMinutes = 5) {
  console.log(`👀 Watching schedule ${scheduleId} for changes...`);
  console.log(`⏰ Will wait up to ${maxWaitMinutes} minutes for completion`);
  console.log('');

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
      console.log('❌ Schedule not found!');
      return;
    }

    // Only log status changes
    if (schedule.status !== lastStatus) {
      const timestamp = new Date().toISOString();
      console.log(`[${timestamp}] Status: ${lastStatus} → ${schedule.status}`);

      if (schedule.attempts > 0) {
        console.log(`   Attempts: ${schedule.attempts}`);
      }

      if (schedule.error) {
        console.log(`   Error: ${schedule.error}`);
      }

      if (schedule.publishedAt) {
        console.log(`   Published at: ${schedule.publishedAt.toISOString()}`);
      }

      lastStatus = schedule.status;
      console.log('');
    }

    // Check if we're done
    if (schedule.status === ScheduleStatus.PUBLISHED) {
      console.log('🎉 SUCCESS! Post was published successfully');
      return { success: true, schedule };
    }

    if (schedule.status === ScheduleStatus.FAILED) {
      console.log('💥 FAILED! Post failed to publish after all retries');
      return { success: false, schedule };
    }

    // Wait 10 seconds before checking again
    await new Promise((resolve) => setTimeout(resolve, 10000));
  }

  console.log(`⏰ Timeout: No completion after ${maxWaitMinutes} minutes`);
  return { success: false, timeout: true };
}

async function triggerSchedulerCheck() {
  console.log('🚀 Manually triggering scheduler check...');

  try {
    const response = await fetch('http://localhost:3007/api/scheduler', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'checkPending' }),
    });

    if (response.ok) {
      console.log('✅ Scheduler check triggered successfully');
    } else {
      console.log(
        '⚠️  Scheduler API not available (server might not be running)'
      );
    }
  } catch (error) {
    console.log(
      '⚠️  Could not reach scheduler API (server might not be running)'
    );
  }

  console.log('');
}

async function cleanup(ids: {
  campaignId: string;
  scheduleId: string;
  contentId: string;
  destinationId: string;
}) {
  console.log('🧹 Cleaning up test data...');

  try {
    await database.schedule.delete({ where: { id: ids.scheduleId } });
    await database.content.delete({ where: { id: ids.contentId } });
    await database.destination.delete({ where: { id: ids.destinationId } });
    await database.campaign.delete({ where: { id: ids.campaignId } });

    console.log('✅ Cleanup completed');
  } catch (error) {
    console.log('⚠️  Cleanup failed:', error);
  }
}

async function main() {
  console.log('🧪 Publishing Queue Test Script');
  console.log('================================');
  console.log('');

  try {
    // Step 1: Create test data
    const { campaign, content, destination, schedule } = await createTestData();

    // Step 2: Trigger scheduler check
    await triggerSchedulerCheck();

    // Step 3: Watch for changes
    console.log('📋 Instructions:');
    console.log('1. Make sure your dev server is running (npm run dev)');
    console.log('2. The scheduler runs every minute automatically');
    console.log('3. Watch below for status changes...');
    console.log('');

    const result = await watchSchedule(schedule.id);

    // Step 4: Report results
    console.log('📊 Test Results:');
    console.log('================');

    if (result?.success) {
      console.log('✅ PASS: Publishing queue system working correctly!');
      console.log('   - Scheduler detected the pending post');
      console.log('   - Status updated properly during processing');
      console.log('   - Mock publication completed successfully');
    } else if (result?.timeout) {
      console.log('⏰ TIMEOUT: Test did not complete in time');
      console.log('   - Check if the dev server is running');
      console.log('   - Check browser console for scheduler logs');
    } else {
      console.log('❌ FAIL: Post failed to publish');
      console.log('   - This might be expected (10% mock failure rate)');
      console.log('   - Check the error message above');
    }

    console.log('');

    // Step 5: Cleanup
    await cleanup({
      campaignId: campaign.id,
      scheduleId: schedule.id,
      contentId: content.id,
      destinationId: destination.id,
    });
  } catch (error) {
    console.error('💥 Test script failed:', error);
    process.exit(1);
  }

  console.log('🏁 Test completed!');
  process.exit(0);
}

// Handle cleanup on exit
process.on('SIGINT', async () => {
  console.log(
    '\n🛑 Test interrupted. You may need to manually clean up test data.'
  );
  process.exit(0);
});

// Run the test
main().catch(console.error);
