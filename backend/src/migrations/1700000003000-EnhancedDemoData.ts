import { MigrationInterface, QueryRunner } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

export class EnhancedDemoData1700000003000 implements MigrationInterface {
  name = 'EnhancedDemoData1700000003000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create sample guests with hash codes for RSVP testing
    const sampleGuests = [
      {
        id: uuidv4(),
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
        id: uuidv4(),
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
        id: uuidv4(),
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
        id: uuidv4(),
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
        id: uuidv4(),
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
        id: uuidv4(),
        hashCode: 'WORK2023',
        firstName: 'David',
        lastName: 'Miller',
        email: 'david.miller@example.com',
        phoneNumber: '+1-555-0106',
        partySize: 2,
        dietaryRestrictions: 'Vegan',
        specialRequests: '',
      },
    ];

    // Insert sample guests
    for (const guest of sampleGuests) {
      await queryRunner.query(
        `
        INSERT INTO "guests" (
          "id", "hash_code", "first_name", "last_name", "email", 
          "phone_number", "party_size", "dietary_restrictions", 
          "special_requests", "created_at", "updated_at"
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
      `,
        [
          guest.id,
          guest.hashCode,
          guest.firstName,
          guest.lastName,
          guest.email,
          guest.phoneNumber,
          guest.partySize,
          guest.dietaryRestrictions,
          guest.specialRequests,
        ],
      );
    }

    // Create sample RSVP confirmations for some guests
    const rsvpConfirmations = [
      {
        id: uuidv4(),
        guestId: sampleGuests[0].id, // Emma Johnson
        isAttending: true,
        confirmedPartySize: 2,
        message:
          "So excited to celebrate with you both! Can't wait for the big day.",
        confirmedAt: new Date('2024-05-01T10:30:00Z').toISOString(),
      },
      {
        id: uuidv4(),
        guestId: sampleGuests[1].id, // Michael Smith
        isAttending: true,
        confirmedPartySize: 4,
        message:
          'The whole family is looking forward to it. Thank you for including us!',
        confirmedAt: new Date('2024-05-03T14:15:00Z').toISOString(),
      },
      {
        id: uuidv4(),
        guestId: sampleGuests[2].id, // Sarah Davis
        isAttending: false,
        confirmedPartySize: 0,
        message:
          "Unfortunately we won't be able to make it due to a prior commitment. Wishing you both all the best!",
        confirmedAt: new Date('2024-05-05T09:45:00Z').toISOString(),
      },
      {
        id: uuidv4(),
        guestId: sampleGuests[4].id, // Lisa Brown
        isAttending: true,
        confirmedPartySize: 3,
        message: "Wouldn't miss it for the world! See you there.",
        confirmedAt: new Date('2024-05-07T16:20:00Z').toISOString(),
      },
    ];

    // Insert RSVP confirmations
    for (const rsvp of rsvpConfirmations) {
      await queryRunner.query(
        `
        INSERT INTO "rsvp_confirmations" (
          "id", "guest_id", "is_attending", "confirmed_party_size", 
          "message", "confirmed_at", "created_at", "updated_at"
        )
        VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
      `,
        [
          rsvp.id,
          rsvp.guestId,
          rsvp.isAttending ? 1 : 0,
          rsvp.confirmedPartySize,
          rsvp.message,
          rsvp.confirmedAt,
        ],
      );
    }

    // Create sample CSV upload record
    const csvUploadId = uuidv4();
    await queryRunner.query(
      `
      INSERT INTO "csv_uploads" (
        "id", "filename", "total_guests", "successful_imports", 
        "created_at", "updated_at"
      )
      VALUES (?, ?, ?, ?, datetime('now'), datetime('now'))
    `,
      [csvUploadId, 'demo_guest_list.csv', 6, 6],
    );

    // Update wedding info with more detailed demo data
    await queryRunner.query(
      `
      UPDATE "wedding_info" 
      SET 
        "presentation_message" = ?,
        "location_directions" = ?
      WHERE "couple_names" = 'Ariane & Timothe'
    `,
      [
        'We are overjoyed to share this magical moment with our beloved family and friends! After years of adventures together, we\'re ready to say "I do" surrounded by the people who mean the most to us. Join us for an enchanting celebration filled with love, laughter, dancing, and unforgettable memories. Your presence is the greatest gift we could ask for as we begin this beautiful new chapter of our lives together.',
        'The Château de Malmaison is located in the heart of Rueil-Malmaison, just 20 minutes from central Paris. \n\n🚗 BY CAR: Free parking is available on-site. Use GPS coordinates: 48.8698° N, 2.1659° E\n\n🚊 BY PUBLIC TRANSPORT: Take RER A to Rueil-Malmaison station (25 minutes from Châtelet), then bus 244 (direction Rueil Centre) to "Château" stop (5 minutes). The venue is a 2-minute walk from the bus stop.\n\n🚕 BY TAXI/UBER: Approximately 30-45 minutes from central Paris, depending on traffic.\n\n📍 The ceremony will begin promptly at 3:00 PM in the beautiful château gardens. Please arrive 15 minutes early for seating.',
      ],
    );

    // Add more detailed accommodations
    await queryRunner.query(
      `
      INSERT INTO "accommodations" (
        "id", "name", "description", "address", "contact_info", 
        "price_range", "is_recommended", "display_order", "created_at", "updated_at"
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `,
      [
        uuidv4(),
        'Airbnb - Charming Apartment in Saint-Germain',
        'Beautiful 2-bedroom apartment in historic Saint-Germain-en-Laye, perfect for couples or small families. Features original French architecture, full kitchen, and walking distance to shops and restaurants.',
        'Various locations in Saint-Germain-en-Laye, France',
        'Book via Airbnb | Search "Saint-Germain-en-Laye wedding weekend"',
        '€80-120/night',
        false,
        4,
      ],
    );

    console.log('✅ Enhanced demo data seeded successfully!');
    console.log('📝 Sample RSVP codes for testing:');
    console.log('   • DEMO2024 (Emma Johnson - 2 guests)');
    console.log('   • FAMILY01 (Michael Smith - 4 guests)');
    console.log('   • COUPLE99 (Sarah Davis - declined)');
    console.log('   • FRIEND42 (James Wilson - 1 guest, not yet responded)');
    console.log('   • COLLEGE8 (Lisa Brown - 3 guests)');
    console.log('   • WORK2023 (David Miller - 2 guests, not yet responded)');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove enhanced demo data
    await queryRunner.query(`DELETE FROM "csv_uploads"`);
    await queryRunner.query(`DELETE FROM "rsvp_confirmations"`);
    await queryRunner.query(`DELETE FROM "guests"`);

    // Reset accommodations to original count
    await queryRunner.query(
      `DELETE FROM "accommodations" WHERE "display_order" > 3`,
    );

    // Reset wedding info to original message
    await queryRunner.query(
      `
      UPDATE "wedding_info" 
      SET 
        "presentation_message" = 'We are thrilled to celebrate our special day with you! Join us for an unforgettable celebration filled with love, laughter, and joy. Your presence means the world to us as we begin this beautiful journey together.',
        "location_directions" = 'The venue is easily accessible by car with complimentary parking available. If traveling by public transport, take RER A to Rueil-Malmaison station, then bus 244 to Château stop. The ceremony will begin promptly at 3:00 PM in the gardens, followed by cocktails and dinner reception.'
      WHERE "couple_names" = 'Ariane & Timothe'
    `,
    );
  }
}
