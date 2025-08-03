#!/usr/bin/env tsx

/**
 * Simple Publishing Queue Test Script
 *
 * This script tests the scheduler via API calls instead of direct database access
 * to avoid server-only module restrictions.
 */

const API_BASE = 'http://localhost:3007';

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function testAPI(endpoint: string, options?: RequestInit) {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, options);
    const data = await response.json();
    return { success: response.ok, data, status: response.status };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

async function createTestData() {}

async function testSchedulerAPI() {
  // Test GET endpoint
  const getResult = await testAPI('/api/scheduler');
  if (getResult.success) {
  } else {
    return false;
  }
  const triggerResult = await testAPI('/api/scheduler', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'checkPending' }),
  });

  if (triggerResult.success) {
  } else {
  }
  return true;
}

async function monitorScheduler() {
  const startTime = Date.now();
  const duration = 3 * 60 * 1000; // 3 minutes
  let _checkCount = 0;

  while (Date.now() - startTime < duration) {
    _checkCount++;
    const _timestamp = new Date().toISOString();

    const result = await testAPI('/api/scheduler', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'checkPending' }),
    });

    if (result.success) {
    } else {
    }
    await sleep(30000);
  }
}

async function checkServerLogs() {}

async function main() {
  // Step 1: Test API connectivity
  const apiWorking = await testSchedulerAPI();
  if (!apiWorking) {
    process.exit(1);
  }

  // Step 2: Show instructions for test data
  await createTestData();

  // Step 3: Show what to look for
  await checkServerLogs();

  await sleep(5000);

  // Step 5: Monitor scheduler
  await monitorScheduler();
}

// Handle Ctrl+C gracefully
process.on('SIGINT', () => {
  process.exit(0);
});

main().catch(console.error);
