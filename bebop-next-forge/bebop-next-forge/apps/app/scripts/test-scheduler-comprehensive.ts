#!/usr/bin/env tsx

import { database } from '@repo/database';
import { ContentType, ContentStatus, CampaignStatus, DestinationType, ScheduleStatus } from '@repo/database/types';

async function createTestData() {
  console.log('🚀 Creating comprehensive scheduler test data...\n');

  // Create a test user ID (in real app, this would come from auth)
  const testUserId = 'test_scheduler_user';

  try {
    // 1. Clean up any existing test data
    console.log('🧹 Cleaning up existing test data...');
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

    // 2. Create test campaign
    console.log('📋 Creating test campaign...');
    const campaign = await database.campaign.create({
      data: {
        userId: testUserId,
        name: 'Scheduler Test Campaign',
        description: 'Testing the publishing queue system',
        status: CampaignStatus.ACTIVE,
      },
    });
    console.log(`✅ Created campaign: ${campaign.name} (${campaign.id})`);

    // 3. Create test destinations for all platform types
    console.log('\n🎯 Creating test destinations...');
    const destinations = await Promise.all([
      database.destination.create({
        data: {
          userId: testUserId,
          name: 'Test Hashnode Blog',
          type: DestinationType.HASHNODE,
          config: {
            publicationId: 'test-publication',
            apiToken: 'test-token'
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
            apiKey: 'test-api-key'
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
            password: 'test-password'
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
            accessToken: 'test-access-token'
          },
          isActive: true,
        },
      }),
    ]);

    destinations.forEach((dest, i) => {
      console.log(`  ${i + 1}. ${dest.name} (${dest.type}) - ${dest.id}`);
    });

    // 4. Create test content
    console.log('\n📝 Creating test content...');
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

    content.forEach((item, i) => {
      console.log(`  ${i + 1}. ${item.title} - ${item.id}`);
    });

    // 5. Create test schedules with different scenarios
    console.log('\n⏰ Creating test schedules...');
    
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

    console.log('\n📅 Created schedules:');
    schedules.forEach((sched, i) => {
      const dest = destinations.find(d => d.id === sched.destinationId);
      const contentItem = content.find(c => c.id === sched.contentId);
      console.log(`  ${i + 1}. "${contentItem?.title}" → ${dest?.name} at ${sched.publishAt.toISOString()}`);
    });

    console.log('\n✅ Test data created successfully!');
    console.log('\n📊 Summary:');
    console.log(`   Campaign: ${campaign.name}`);
    console.log(`   Destinations: ${destinations.length}`);
    console.log(`   Content pieces: ${content.length}`);
    console.log(`   Schedules: ${schedules.length}`);
    console.log(`   
📋 Test Scenarios:
   1. ⚡ Immediate publishing (2 schedules) - should publish within 1 minute
   2. ⏰ Future publishing (2 schedules) - should wait for scheduled time
   3. 🔄 Retry testing (1 schedule) - will test retry logic

🔍 Monitor the scheduler by watching the console logs.
   The scheduler runs every minute and will process due schedules.

💡 To test manually:
   - Check scheduled content page: /scheduled
   - Use API: POST /api/scheduler with action: "publishNow"
   - Watch server console for detailed logs
`);

    return {
      campaignId: campaign.id,
      destinationIds: destinations.map(d => d.id),
      contentIds: content.map(c => c.id),
      scheduleIds: schedules.map(s => s.id),
    };

  } catch (error) {
    console.error('❌ Error creating test data:', error);
    throw error;
  }
}

async function monitorSchedules() {
  console.log('\n🔍 Current schedule status:');
  
  const schedules = await database.schedule.findMany({
    where: {
      campaign: {
        userId: 'test_scheduler_user'
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
      publishAt: 'asc'
    }
  });

  schedules.forEach((schedule, i) => {
    const timeUntil = schedule.publishAt.getTime() - Date.now();
    const timeStr = timeUntil > 0 
      ? `in ${Math.round(timeUntil / (60 * 1000))} minutes`
      : `${Math.round(Math.abs(timeUntil) / (60 * 1000))} minutes ago`;
    
    console.log(`  ${i + 1}. [${schedule.status}] "${schedule.content.title}" → ${schedule.destination.name} (${timeStr})`);
    if (schedule.error) {
      console.log(`     Error: ${schedule.error}`);
    }
    if (schedule.attempts > 0) {
      console.log(`     Attempts: ${schedule.attempts}/3`);
    }
  });
}

// Main execution
async function main() {
  console.log('🧪 Bebop Scheduler Comprehensive Test\n');
  
  try {
    const testData = await createTestData();
    
    // Monitor initial state
    await monitorSchedules();
    
    console.log('\n⏰ Scheduler should be running automatically...');
    console.log('💡 Watch the server console for publishing activity');
    console.log('🔄 Run this script again to check progress');
    
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

export { createTestData, monitorSchedules };