require('dotenv').config({ path: './.env' });
import { SeedService } from '../lib/seed';

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');

    await SeedService.seedStaticData();

    console.log('🎉 Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    process.exit(1);
  }
}

// Handle command line arguments
const args = process.argv.slice(2);

if (args.includes('--reset')) {
  console.log('⚠️  Resetting database before seeding...');
  SeedService.resetDatabase()
    .then(() => seedDatabase())
    .catch((error) => {
      console.error('❌ Reset and seed failed:', error);
      process.exit(1);
    });
} else {
  seedDatabase();
}
