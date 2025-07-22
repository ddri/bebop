#!/usr/bin/env tsx

// Mock server-only module to allow script execution
const Module = require('module');
const originalRequire = Module.prototype.require;
Module.prototype.require = function (id: string) {
  if (id === 'server-only') {
    return {}; // Mock empty object
  }
  return originalRequire.apply(this, arguments);
};

import { database } from '@repo/database';
import { ContentType, ContentStatus, CampaignStatus, DestinationType, ScheduleStatus } from '@repo/database/types';

/**
 * Creates test scenarios to verify scheduler retry logic and failure handling
 */
async function createFailureTestScenarios() {
  console.log('🧪 Creating scheduler failure test scenarios...\n');

  const testUserId = 'test_failure_scheduler';

  try {
    // Clean up existing test data
    console.log('🧹 Cleaning up existing failure test data...');
    await database.schedule.deleteMany({
      where: {
        campaign: {
          userId: testUserId
        }
      }
    });
    await database.content.deleteMany({
      where: {
        campaign: {
          userId: testUserId
        }
      }
    });
    await database.destination.deleteMany({
      where: {
        userId: testUserId
      }
    });
    await database.campaign.deleteMany({
      where: {
        userId: testUserId
      }
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

    // Create destinations with intentionally broken configs to trigger failures
    console.log('🎯 Creating destinations with broken configs...');
    const destinations = await Promise.all([
      database.destination.create({
        data: {
          userId: testUserId,
          name: 'Broken Hashnode Config',
          type: DestinationType.HASHNODE,
          config: {
            publicationId: 'invalid-publication-id',
            apiToken: 'invalid-token-should-fail'
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
            apiKey: 'invalid-dev-to-key'
          },
          isActive: true,
        },
      }),
    ]);

    // Create test content
    console.log('📝 Creating test content for failure scenarios...');
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

    // Create schedules with immediate publish times to trigger failures
    console.log('⏰ Creating failure test schedules...');
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

    console.log('✅ Failure test scenarios created!\n');
    console.log('📊 Test Setup Summary:');
    console.log(`   Campaign: ${campaign.name}`);
    console.log(`   Broken Destinations: ${destinations.length}`);
    console.log(`   Test Content: ${content.length}`);
    console.log(`   Failure Schedules: ${schedules.length}`);

    console.log('\n🔬 Test Scenarios:');
    console.log('   1. ❌ Immediate failures (2 schedules) - should fail and retry 3 times each');
    console.log('   2. 🔄 Manual retry test (1 schedule) - use API to retry failed schedule');
    console.log('   3. ⏰ 5-minute retry delays - failed schedules should reschedule for 5 minutes later');

    console.log('\n🧪 How to test:');
    console.log('   1. Watch server console for failure logs');
    console.log('   2. Check health endpoint: GET /api/scheduler?action=health');
    console.log('   3. Monitor retry attempts with monitoring script');
    console.log('   4. Test manual retry: POST /api/scheduler with {"action": "retry", "scheduleId": "..."}');

    return {
      campaignId: campaign.id,
      destinationIds: destinations.map(d => d.id),
      contentIds: content.map(c => c.id),
      scheduleIds: schedules.map(s => s.id),
      failedScheduleId: schedules[2].id, // For manual retry testing
    };

  } catch (error) {
    console.error('❌ Error creating failure test scenarios:', error);
    throw error;
  }
}

async function monitorFailureTests() {
  console.log('\n🔍 Monitoring failure test progress...');
  
  const schedules = await database.schedule.findMany({
    where: {
      campaign: {
        userId: 'test_failure_scheduler'
      }
    },
    include: {
      content: {
        select: {
          title: true
        }
      },
      destination: {
        select: {
          name: true,
          type: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  console.log('\n📋 Current Status:');
  schedules.forEach((schedule, i) => {
    const timeUntil = schedule.publishAt.getTime() - Date.now();
    const timeStr = timeUntil > 0 
      ? `in ${Math.round(timeUntil / (60 * 1000))} minutes`
      : `${Math.round(Math.abs(timeUntil) / (60 * 1000))} minutes ago`;
    
    console.log(`  ${i + 1}. [${schedule.status}] "${schedule.content.title}"`);
    console.log(`     → ${schedule.destination.name} (${schedule.destination.type})`);
    console.log(`     → Scheduled: ${timeStr}`);
    console.log(`     → Attempts: ${schedule.attempts}/3`);
    
    if (schedule.error) {
      console.log(`     → Error: ${schedule.error}`);
    }
    
    if (schedule.lastAttemptAt) {
      const lastAttempt = new Date(schedule.lastAttemptAt);
      const minutesSinceAttempt = Math.round((Date.now() - lastAttempt.getTime()) / (60 * 1000));
      console.log(`     → Last attempt: ${minutesSinceAttempt} minutes ago`);
    }
    
    console.log('');
  });

  // Show summary stats
  const stats = schedules.reduce((acc, s) => {
    acc[s.status] = (acc[s.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  console.log('📊 Summary:');
  Object.entries(stats).forEach(([status, count]) => {
    console.log(`   ${status}: ${count}`);
  });
}

async function testManualRetry(scheduleId: string) {
  console.log(`\n🔄 Testing manual retry for schedule: ${scheduleId}`);
  
  try {
    const response = await fetch('http://localhost:3000/api/scheduler', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'retry',
        scheduleId
      }),
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Manual retry initiated:', result.message);
    } else {
      console.log('❌ Manual retry failed:', result.error);
    }
  } catch (error) {
    console.log('❌ Error testing manual retry:', error);
  }
}

// Main execution
async function main() {
  const command = process.argv[2];
  
  try {
    switch (command) {
      case 'create':
        const testData = await createFailureTestScenarios();
        console.log('\n💡 Next steps:');
        console.log('   - Run "npm run test:scheduler:failures monitor" to watch progress');
        console.log(`   - Run "npm run test:scheduler:failures retry ${testData.failedScheduleId}" to test manual retry`);
        break;
        
      case 'monitor':
        await monitorFailureTests();
        break;
        
      case 'retry':
        const scheduleId = process.argv[3];
        if (!scheduleId) {
          console.log('❌ Please provide a schedule ID for retry testing');
          console.log('Usage: npm run test:scheduler:failures retry <scheduleId>');
          process.exit(1);
        }
        await testManualRetry(scheduleId);
        break;
        
      default:
        console.log('🧪 Bebop Scheduler Failure Testing\n');
        console.log('Commands:');
        console.log('  create  - Create failure test scenarios');
        console.log('  monitor - Monitor current test progress');
        console.log('  retry   - Test manual retry for a failed schedule');
        console.log('\nUsage:');
        console.log('  npm run test:scheduler:failures create');
        console.log('  npm run test:scheduler:failures monitor');
        console.log('  npm run test:scheduler:failures retry <scheduleId>');
    }
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  } finally {
    await database.$disconnect();
  }
}

if (import.meta.url.endsWith(process.argv[1])) {
  main();
}

export { createFailureTestScenarios, monitorFailureTests, testManualRetry };