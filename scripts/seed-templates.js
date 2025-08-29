#!/usr/bin/env node

// Script to seed campaign templates
// Run with: node scripts/seed-templates.js

require('ts-node/register');
require('dotenv').config();

const { seedTemplates } = require('../src/lib/seed-templates.ts');

seedTemplates()
  .then(() => {
    console.log('✅ Template seeding completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Template seeding failed:', error);
    process.exit(1);
  });