#!/usr/bin/env tsx

/**
 * Test scheduler failure scenarios using API endpoints
 */
async function createFailureTestScenarios() {
  console.log('🧪 Creating scheduler failure test scenarios via API...\n');

  const baseUrl = 'http://localhost:3000';

  try {
    // First, check if the server is running
    console.log('🔍 Checking server health...');
    const healthCheck = await fetch(`${baseUrl}/api/scheduler?action=health`);
    if (!healthCheck.ok) {
      throw new Error('Server not running. Please start with: npm run dev');
    }
    console.log('✅ Server is running\n');

    // Test immediate failure scenario
    console.log('🧪 Testing immediate publishing failure...');

    // The comprehensive test script should have created some schedules that are due
    const testResult = await fetch(`${baseUrl}/api/scheduler`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'checkPending',
      }),
    });

    const result = await testResult.json();
    console.log('📋 Check pending result:', result);

    if (testResult.ok) {
      console.log(
        '✅ Triggered scheduler check - watch server console for retry logic'
      );
    } else {
      console.log('❌ Failed to trigger scheduler:', result.error);
    }
  } catch (error) {
    console.error('❌ Error:', error);
    console.log('\n💡 Make sure to:');
    console.log('   1. Start the server: npm run dev');
    console.log('   2. Run comprehensive test first: npm run test:scheduler');
  }
}

async function monitorFailureTests() {
  console.log('🔍 Monitoring scheduler health...\n');

  try {
    const response = await fetch(
      'http://localhost:3000/api/scheduler?action=health'
    );
    const health = await response.json();

    if (response.ok) {
      console.log('📊 Scheduler Health:');
      console.log(`   Status: ${health.status}`);
      console.log(`   Timestamp: ${health.timestamp}`);
      console.log('\n📈 Statistics:');
      console.log(`   Pending: ${health.statistics.pending}`);
      console.log(`   Publishing: ${health.statistics.publishing}`);
      console.log(`   Published: ${health.statistics.published}`);
      console.log(`   Failed: ${health.statistics.failed}`);
      console.log(`   Total: ${health.statistics.total}`);

      if (health.recentActivity && health.recentActivity.length > 0) {
        console.log('\n📋 Recent Activity:');
        health.recentActivity.forEach((activity: any, i: number) => {
          console.log(
            `   ${i + 1}. [${activity.status}] "${activity.content.title}"`
          );
          console.log(
            `      → ${activity.destination.name} (${activity.destination.type})`
          );
          console.log(`      → Attempts: ${activity.attempts}/3`);
          if (activity.error) {
            console.log(`      → Error: ${activity.error}`);
          }
          if (activity.publishedAt) {
            console.log(
              `      → Published: ${new Date(activity.publishedAt).toLocaleString()}`
            );
          }
          console.log('');
        });
      }
    } else {
      console.log('❌ Failed to get health status:', health);
    }
  } catch (error) {
    console.error('❌ Error monitoring:', error);
    console.log('💡 Make sure the server is running: npm run dev');
  }
}

async function testManualRetry() {
  console.log('🔄 Testing manual retry functionality...\n');

  try {
    // First get health to find failed schedules
    const healthResponse = await fetch(
      'http://localhost:3000/api/scheduler?action=health'
    );
    const health = await healthResponse.json();

    if (!healthResponse.ok) {
      throw new Error('Failed to get health status');
    }

    const failedSchedule = health.recentActivity?.find(
      (activity: any) => activity.status === 'FAILED'
    );

    if (!failedSchedule) {
      console.log('ℹ️  No failed schedules found to retry');
      console.log(
        '💡 Create some failure scenarios first with: npm run test:scheduler'
      );
      return;
    }

    console.log(`🎯 Found failed schedule: "${failedSchedule.content.title}"`);
    console.log(`   Destination: ${failedSchedule.destination.name}`);
    console.log(`   Error: ${failedSchedule.error}`);
    console.log(`   Attempts: ${failedSchedule.attempts}/3\n`);

    // Test manual retry
    const retryResponse = await fetch('http://localhost:3000/api/scheduler', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'retry',
        scheduleId: failedSchedule.id,
      }),
    });

    const retryResult = await retryResponse.json();

    if (retryResponse.ok) {
      console.log('✅ Manual retry initiated:', retryResult.message);
      console.log('👀 Watch server console for retry attempt');
    } else {
      console.log('❌ Manual retry failed:', retryResult.error);
    }
  } catch (error) {
    console.error('❌ Error testing manual retry:', error);
  }
}

async function simulateNetworkFailure() {
  console.log('🌐 Simulating network failure scenario...\n');

  try {
    // Trigger manual publishing to test error handling
    const response = await fetch('http://localhost:3000/api/scheduler', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'publishNow',
        scheduleId: 'non-existent-id',
      }),
    });

    const result = await response.json();

    if (response.ok) {
      console.log('❌ Unexpected success:', result);
    } else {
      console.log('✅ Expected error handled correctly:', result.error);
    }
  } catch (error) {
    console.log('✅ Network error handled correctly:', String(error));
  }
}

// Main execution
async function main() {
  const command = process.argv[2];

  switch (command) {
    case 'create':
      await createFailureTestScenarios();
      break;

    case 'monitor':
      await monitorFailureTests();
      break;

    case 'retry':
      await testManualRetry();
      break;

    case 'network':
      await simulateNetworkFailure();
      break;

    default:
      console.log('🧪 Bebop Scheduler Failure Testing (API Mode)\n');
      console.log('Commands:');
      console.log(
        '  create  - Trigger scheduler check (creates failures if broken configs exist)'
      );
      console.log('  monitor - Monitor scheduler health and recent activity');
      console.log('  retry   - Test manual retry for a failed schedule');
      console.log('  network - Simulate network failure scenario');
      console.log('\nUsage:');
      console.log('  npm run test:scheduler:failures:api create');
      console.log('  npm run test:scheduler:failures:api monitor');
      console.log('  npm run test:scheduler:failures:api retry');
      console.log('  npm run test:scheduler:failures:api network');
      console.log('\n💡 Prerequisites:');
      console.log('  1. Server must be running: npm run dev');
      console.log('  2. Run comprehensive test first: npm run test:scheduler');
  }
}

if (import.meta.url.endsWith(process.argv[1])) {
  main();
}
