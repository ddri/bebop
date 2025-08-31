import { seedTemplates } from '../src/lib/seed-templates';

async function main() {
  console.log('Starting database seed...');
  await seedTemplates();
  console.log('Database seed complete!');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    process.exit(0);
  });