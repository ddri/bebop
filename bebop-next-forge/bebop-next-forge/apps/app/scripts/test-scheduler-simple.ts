#!/usr/bin/env tsx

/**
 * Simple Publishing Queue Test Script
 * 
 * This script tests the scheduler via API calls instead of direct database access
 * to avoid server-only module restrictions.
 */

const API_BASE = 'http://localhost:3007';

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
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

async function createTestData() {
  console.log('🔧 Creating test data via API...');
  
  // For now, we'll simulate creating test data
  // In a real test, you'd call your APIs to create the data
  
  console.log('⚠️  Note: This test requires you to manually create test data through the UI:');
  console.log('   1. Create a campaign: "Test Campaign"');
  console.log('   2. Create content: "Test Post"');
  console.log('   3. Create a destination: Any Phase 1 platform');
  console.log('   4. Schedule the content for 1-2 minutes from now');
  console.log('');
  console.log('   OR we can test with existing scheduled posts...');
  console.log('');
}

async function testSchedulerAPI() {
  console.log('🚀 Testing Scheduler API...');
  
  // Test GET endpoint
  const getResult = await testAPI('/api/scheduler');
  if (getResult.success) {
    console.log('✅ Scheduler API is accessible');
    console.log('   Response:', getResult.data);
  } else {
    console.log('❌ Cannot reach scheduler API');
    console.log('   Error:', getResult.error);
    return false;
  }
  
  console.log('');
  
  // Test manual trigger
  console.log('🎯 Triggering manual scheduler check...');
  const triggerResult = await testAPI('/api/scheduler', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'checkPending' }),
  });
  
  if (triggerResult.success) {
    console.log('✅ Manual trigger successful');
    console.log('   Response:', triggerResult.data);
  } else {
    console.log('❌ Manual trigger failed');
    console.log('   Error:', triggerResult.error);
  }
  
  console.log('');
  return true;
}

async function monitorScheduler() {
  console.log('👀 Monitoring scheduler activity...');
  console.log('⏰ Will trigger checks every 30 seconds for 3 minutes');
  console.log('📋 Watch your browser console (dev server) for scheduler logs');
  console.log('');
  
  const startTime = Date.now();
  const duration = 3 * 60 * 1000; // 3 minutes
  let checkCount = 0;
  
  while (Date.now() - startTime < duration) {
    checkCount++;
    const timestamp = new Date().toISOString();
    
    console.log(`[${timestamp}] Check #${checkCount} - Triggering scheduler...`);
    
    const result = await testAPI('/api/scheduler', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'checkPending' }),
    });
    
    if (result.success) {
      console.log(`   ✅ Scheduler check completed`);
    } else {
      console.log(`   ❌ Scheduler check failed: ${result.error}`);
    }
    
    // Wait 30 seconds before next check
    console.log('   ⏳ Waiting 30 seconds...');
    await sleep(30000);
    console.log('');
  }
  
  console.log('⏰ Monitoring period completed');
}

async function checkServerLogs() {
  console.log('📋 Things to check in your dev server logs:');
  console.log('');
  console.log('✅ Look for these messages:');
  console.log('   - "📅 Publishing scheduler started"');
  console.log('   - "Found X schedules ready to publish"');
  console.log('   - "Publishing <title> to <destination>"');
  console.log('   - "✅ Published successfully to <platform>"');
  console.log('   - "❌ Schedule <id> failed: <error>"');
  console.log('');
  console.log('🔍 Expected scheduler behavior:');
  console.log('   - Automatic check every 60 seconds');
  console.log('   - Manual checks via API should work immediately');
  console.log('   - Status updates in database: PENDING → PUBLISHING → PUBLISHED/FAILED');
  console.log('');
}

async function main() {
  console.log('🧪 Simple Publishing Queue Test');
  console.log('================================');
  console.log('');
  
  // Step 1: Test API connectivity
  const apiWorking = await testSchedulerAPI();
  if (!apiWorking) {
    console.log('💥 Cannot proceed - API not accessible');
    console.log('🔧 Make sure your dev server is running: npm run dev');
    process.exit(1);
  }
  
  // Step 2: Show instructions for test data
  await createTestData();
  
  // Step 3: Show what to look for
  await checkServerLogs();
  
  // Step 4: Ask user if they want to proceed
  console.log('🚀 Ready to start monitoring?');
  console.log('   This will trigger scheduler checks every 30 seconds for 3 minutes');
  console.log('   Press Ctrl+C to skip, or wait 5 seconds to continue...');
  console.log('');
  
  await sleep(5000);
  
  // Step 5: Monitor scheduler
  await monitorScheduler();
  
  // Step 6: Final instructions
  console.log('📊 Test Summary:');
  console.log('================');
  console.log('');
  console.log('✅ If you saw these in your dev server logs, the system is working:');
  console.log('   - Scheduler started message');
  console.log('   - Periodic "Found X schedules" messages');
  console.log('   - Publishing attempts with success/failure messages');
  console.log('');
  console.log('❌ If you saw errors or no messages:');
  console.log('   - Check database connection');
  console.log('   - Verify scheduled posts exist with future publishAt times');
  console.log('   - Check for import/compilation errors');
  console.log('');
  console.log('🎯 Next steps:');
  console.log('   1. Create test schedules via the UI');
  console.log('   2. Watch them get picked up automatically');
  console.log('   3. Verify status changes in the schedules page');
  console.log('');
  console.log('🏁 Test completed!');
}

// Handle Ctrl+C gracefully
process.on('SIGINT', () => {
  console.log('\n🛑 Test interrupted by user');
  process.exit(0);
});

main().catch(console.error);