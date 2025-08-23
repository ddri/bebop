#!/usr/bin/env node

const { exec } = require('child_process');

console.log('🧪 Running Bebop Smoke Tests...\n');

// Run smoke tests with timeout
const testProcess = exec('pnpm test:smoke', { timeout: 30000 });

testProcess.stdout.on('data', (data) => {
  process.stdout.write(data);
});

testProcess.stderr.on('data', (data) => {
  process.stderr.write(data);
});

testProcess.on('close', (code) => {
  if (code === 0) {
    console.log('\n✅ All smoke tests passed!');
    console.log('\n🚀 You can now:');
    console.log('   - Run `pnpm dev` to start development server');
    console.log('   - Test scheduling at /campaigns/[id]'); 
    console.log('   - Test lazy loading on /write, /media, /settings');
    console.log('   - Run `pnpm build:analyze` for bundle analysis');
  } else {
    console.log(`\n❌ Some tests failed (exit code: ${code})`);
    console.log('Check the output above for details.');
  }
  process.exit(code);
});

testProcess.on('error', (error) => {
  console.error(`\n💥 Test runner error: ${error.message}`);
  process.exit(1);
});