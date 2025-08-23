#!/usr/bin/env node

/**
 * Manual workflow test script
 * Run this after starting the dev server to test key functionality
 */

const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3007';

async function testWorkflow() {
  console.log('🧪 Testing Bebop Publishing Workflow\n');

  // Test 1: Health check
  console.log('1️⃣ Testing API health...');
  try {
    const response = await fetch(`${baseUrl}/api/health/database`);
    if (response.ok) {
      console.log('   ✅ Database connection healthy');
    } else {
      console.log('   ❌ Database connection failed');
    }
  } catch (error) {
    console.log('   ❌ API not reachable - is dev server running?');
    return;
  }

  // Test 2: Scheduler trigger
  console.log('\n2️⃣ Testing scheduler trigger...');
  try {
    const response = await fetch(`${baseUrl}/api/scheduler/trigger`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    if (response.ok) {
      const result = await response.json();
      console.log('   ✅ Scheduler trigger successful');
      console.log(`   📊 Processed: ${result.result?.processed || 0} items`);
    } else {
      console.log('   ❌ Scheduler trigger failed');
    }
  } catch (error) {
    console.log('   ❌ Scheduler trigger error:', error.message);
  }

  // Test 3: Process scheduled items
  console.log('\n3️⃣ Testing scheduled publication processor...');
  try {
    const response = await fetch(`${baseUrl}/api/publishing-plans/process-scheduled`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    if (response.ok) {
      const result = await response.json();
      console.log('   ✅ Process scheduled successful');
      console.log(`   📊 Message: ${result.message}`);
    } else {
      console.log('   ❌ Process scheduled failed');
    }
  } catch (error) {
    console.log('   ❌ Process scheduled error:', error.message);
  }

  console.log('\n🎯 Manual Testing Guide:');
  console.log('   1. Visit http://localhost:3007/campaigns');
  console.log('   2. Create a campaign or click existing one');
  console.log('   3. Use HybridPublisher to test scheduling modes');
  console.log('   4. Check lazy loading on /write, /media, /settings');
  console.log('   5. Run `pnpm build:analyze` to check bundle sizes');
  
  console.log('\n🔧 Key Features to Test:');
  console.log('   - Publish Now: Immediate publishing');
  console.log('   - Add to Queue: 1-hour delay scheduling');
  console.log('   - Custom Schedule: User-selected date/time');
  console.log('   - Process Now button: Manual scheduler trigger');
  console.log('   - Component lazy loading with skeleton states');
}

testWorkflow().catch(console.error);