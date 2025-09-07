#!/usr/bin/env ts-node

import { config } from 'dotenv';
import { join } from 'path';
import { DataSource } from 'typeorm';

// Load environment variables
config({ path: join(__dirname, '../../.env') });

// Import entities
import { Accommodation } from '../entities/accommodation.entity';
import { Admin } from '../entities/admin.entity';
import { CSVUpload } from '../entities/csv-upload.entity';
import { Guest } from '../entities/guest.entity';
import { ProgramEvent } from '../entities/program-event.entity';
import { RSVPConfirmation } from '../entities/rsvp-confirmation.entity';
import { WeddingInfo } from '../entities/wedding-info.entity';

async function seedDemoData() {
  console.log('🌱 Starting demo data seeding...');

  const dataSource = new DataSource({
    type: 'sqlite',
    database: process.env.DATABASE_PATH || './wedding.db',
    entities: [
      Admin,
      WeddingInfo,
      Accommodation,
      Guest,
      RSVPConfirmation,
      CSVUpload,
      ProgramEvent,
    ],
    synchronize: false,
    logging: false,
  });

  try {
    await dataSource.initialize();
    console.log('📊 Database connection established');

    // Clear existing demo data (keep structure)
    await dataSource.getRepository(RSVPConfirmation).delete({});
    await dataSource.getRepository(Guest).delete({});
    await dataSource.getRepository(CSVUpload).delete({});

    console.log('🧹 Cleared existing demo data');

    // Create sample guests
    const guestRepository = dataSource.getRepository(Guest);
    const sampleGuests = [
      {
        hashCode: 'DEMO2024',
        firstName: 'Emma',
        lastName: 'Johnson',
        email: 'emma.johnson@example.com',
        phoneNumber: '+1-555-0101',
        partySize: 2,
        dietaryRestrictions: '',
        specialRequests: '',
      },
      {
        hashCode: 'FAMILY01',
        firstName: 'Michael',
        lastName: 'Smith',
        email: 'michael.smith@example.com',
        phoneNumber: '+1-555-0102',
        partySize: 4,
        dietaryRestrictions: 'Vegetarian for 2 guests',
        specialRequests: 'High chair needed for toddler',
      },
      {
        hashCode: 'COUPLE99',
        firstName: 'Sarah',
        lastName: 'Davis',
        email: 'sarah.davis@example.com',
        phoneNumber: '+1-555-0103',
        partySize: 2,
        dietaryRestrictions: 'Gluten-free',
        specialRequests: '',
      },
      {
        hashCode: 'FRIEND42',
        firstName: 'James',
        lastName: 'Wilson',
        email: 'james.wilson@example.com',
        phoneNumber: '+1-555-0104',
        partySize: 1,
        dietaryRestrictions: '',
        specialRequests: 'Wheelchair accessible seating',
      },
      {
        hashCode: 'COLLEGE8',
        firstName: 'Lisa',
        lastName: 'Brown',
        email: 'lisa.brown@example.com',
        phoneNumber: '+1-555-0105',
        partySize: 3,
        dietaryRestrictions: 'No shellfish allergies',
        specialRequests: '',
      },
      {
        hashCode: 'WORK2023',
        firstName: 'David',
        lastName: 'Miller',
        email: 'david.miller@example.com',
        phoneNumber: '+1-555-0106',
        partySize: 2,
        dietaryRestrictions: 'Vegan',
        specialRequests: '',
      },
      {
        hashCode: 'BESTMAN1',
        firstName: 'Alex',
        lastName: 'Thompson',
        email: 'alex.thompson@example.com',
        phoneNumber: '+1-555-0107',
        partySize: 1,
        dietaryRestrictions: '',
        specialRequests: 'Best man speech at 8 PM',
      },
      {
        hashCode: 'COUSIN77',
        firstName: 'Marie',
        lastName: 'Dubois',
        email: 'marie.dubois@example.com',
        phoneNumber: '+33-1-23-45-67-89',
        partySize: 3,
        dietaryRestrictions: 'Lactose intolerant',
        specialRequests: 'Traveling from France',
      },
    ];

    const createdGuests = await guestRepository.save(sampleGuests);
    console.log(`👥 Created ${createdGuests.length} sample guests`);

    // Create sample RSVP confirmations
    const rsvpRepository = dataSource.getRepository(RSVPConfirmation);
    const rsvpConfirmations = [
      {
        guest: createdGuests[0], // Emma Johnson
        isAttending: true,
        confirmedPartySize: 2,
        message:
          "So excited to celebrate with you both! Can't wait for the big day. 💕",
        confirmedAt: new Date('2024-05-01T10:30:00Z'),
      },
      {
        guest: createdGuests[1], // Michael Smith
        isAttending: true,
        confirmedPartySize: 4,
        message:
          'The whole family is looking forward to it. Thank you for including us! The kids are especially excited.',
        confirmedAt: new Date('2024-05-03T14:15:00Z'),
      },
      {
        guest: createdGuests[2], // Sarah Davis
        isAttending: false,
        confirmedPartySize: 0,
        message:
          "Unfortunately we won't be able to make it due to a prior commitment. Wishing you both all the best! 💐",
        confirmedAt: new Date('2024-05-05T09:45:00Z'),
      },
      {
        guest: createdGuests[4], // Lisa Brown
        isAttending: true,
        confirmedPartySize: 3,
        message:
          "Wouldn't miss it for the world! See you there. Can't wait to party! 🎉",
        confirmedAt: new Date('2024-05-07T16:20:00Z'),
      },
      {
        guest: createdGuests[6], // Alex Thompson (Best man)
        isAttending: true,
        confirmedPartySize: 1,
        message:
          'Honored to be your best man! Speech is ready and tissues are packed. 😄',
        confirmedAt: new Date('2024-05-10T11:00:00Z'),
      },
    ];

    await rsvpRepository.save(rsvpConfirmations);
    console.log(`💌 Created ${rsvpConfirmations.length} RSVP confirmations`);

    // Create sample CSV upload record
    const csvUploadRepository = dataSource.getRepository(CSVUpload);
    await csvUploadRepository.save({
      filename: 'demo_guest_list.csv',
      totalGuests: createdGuests.length,
      successfulImports: createdGuests.length,
    });
    console.log('📄 Created CSV upload record');

    // Update wedding info with enhanced content
    const weddingInfoRepository = dataSource.getRepository(WeddingInfo);
    const existingWeddingInfo = await weddingInfoRepository.findOne({
      where: { coupleNames: 'Ariane & Timothe' },
    });

    if (existingWeddingInfo) {
      existingWeddingInfo.presentationMessage = `We are overjoyed to share this magical moment with our beloved family and friends! 

After years of adventures together, we're ready to say "I do" surrounded by the people who mean the most to us. Join us for an enchanting celebration filled with love, laughter, dancing, and unforgettable memories. 

Your presence is the greatest gift we could ask for as we begin this beautiful new chapter of our lives together. ✨💕`;

      existingWeddingInfo.locationDirections = `The Château de Malmaison is located in the heart of Rueil-Malmaison, just 20 minutes from central Paris.

🚗 **BY CAR**: Free parking is available on-site. Use GPS coordinates: 48.8698° N, 2.1659° E

🚊 **BY PUBLIC TRANSPORT**: Take RER A to Rueil-Malmaison station (25 minutes from Châtelet), then bus 244 (direction Rueil Centre) to "Château" stop (5 minutes). The venue is a 2-minute walk from the bus stop.

🚕 **BY TAXI/UBER**: Approximately 30-45 minutes from central Paris, depending on traffic.

📍 The ceremony will begin promptly at 3:00 PM in the beautiful château gardens. Please arrive 15 minutes early for seating.`;

      await weddingInfoRepository.save(existingWeddingInfo);
      console.log('💒 Updated wedding information');
    }

    console.log('\n✅ Demo data seeding completed successfully!');
    console.log('\n📝 Sample RSVP codes for testing:');
    console.log('   🎯 DEMO2024 (Emma Johnson - 2 guests, confirmed)');
    console.log('   👨‍👩‍👧‍👦 FAMILY01 (Michael Smith - 4 guests, confirmed)');
    console.log('   ❌ COUPLE99 (Sarah Davis - declined)');
    console.log('   ⏳ FRIEND42 (James Wilson - 1 guest, not yet responded)');
    console.log('   ✅ COLLEGE8 (Lisa Brown - 3 guests, confirmed)');
    console.log('   ⏳ WORK2023 (David Miller - 2 guests, not yet responded)');
    console.log('   🤵 BESTMAN1 (Alex Thompson - best man, confirmed)');
    console.log('   🇫🇷 COUSIN77 (Marie Dubois - 3 guests, not yet responded)');
    console.log('\n🔐 Admin login: admin@wedding.com / admin123');
  } catch (error) {
    console.error('❌ Error seeding demo data:', error);
    throw error;
  } finally {
    await dataSource.destroy();
  }
}

// Run the seeding function if called directly
if (require.main === module) {
  seedDemoData()
    .then(() => {
      console.log('🎉 Demo data seeding script completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Demo data seeding failed:', error);
      process.exit(1);
    });
}

export { seedDemoData };
