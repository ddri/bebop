#!/usr/bin/env tsx

/**
 * Test scheduler failure scenarios using API endpoints
 */

interface ScheduleActivity {
  status: string;
  content: {
    title: string;
  };
  destination: {
    name: string;
    type: string;
  };
}

interface HealthResponse {
  statistics: {
    total: number;
  };
  recentActivity?: ScheduleActivity[];
}
async function createFailureTestScenarios() {
  const baseUrl = 'http://localhost:3000';

  try {
    const healthCheck = await fetch(`${baseUrl}/api/scheduler?action=health`);
    if (!healthCheck.ok) {
      throw new Error('Server not running. Please start with: npm run dev');
    }

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

    const _result = await testResult.json();

    if (testResult.ok) {
    } else {
    }
  } catch (_error) {}
}

async function monitorFailureTests() {
  try {
    const response = await fetch(
      'http://localhost:3000/api/scheduler?action=health'
    );
    const health = await response.json();

    if (response.ok) {
      if (health.recentActivity && health.recentActivity.length > 0) {
        health.recentActivity.forEach(
          (activity: ScheduleActivity, _i: number) => {
            if (activity.error) {
            }
            if (activity.publishedAt) {
            }
          }
        );
      }
    } else {
    }
  } catch (_error) {}
}

async function testManualRetry() {
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
      (activity: ScheduleActivity) => activity.status === 'FAILED'
    );

    if (!failedSchedule) {
      return;
    }

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

    const _retryResult = await retryResponse.json();

    if (retryResponse.ok) {
    } else {
    }
  } catch (_error) {}
}

async function simulateNetworkFailure() {
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

    const _result = await response.json();

    if (response.ok) {
    } else {
    }
  } catch (_error) {}
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

    default: {
    }
  }
}

if (import.meta.url.endsWith(process.argv[1])) {
  main();
}
