import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateDemoGuestData1700000006000 implements MigrationInterface {
  name = 'UpdateDemoGuestData1700000006000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Update the demo guests with the missing data after the schema has been updated
    const guestUpdates = [
      {
        hashCode: 'DEMO2024',
        phoneNumber: '+1-555-0101',
        partySize: 2,
        dietaryRestrictions: '',
        specialRequests: '',
      },
      {
        hashCode: 'FAMILY01',
        phoneNumber: '+1-555-0102',
        partySize: 4,
        dietaryRestrictions: 'Vegetarian for 2 guests',
        specialRequests: 'High chair needed for toddler',
      },
      {
        hashCode: 'COUPLE99',
        phoneNumber: '+1-555-0103',
        partySize: 2,
        dietaryRestrictions: 'Gluten-free',
        specialRequests: '',
      },
      {
        hashCode: 'FRIEND42',
        phoneNumber: '+1-555-0104',
        partySize: 1,
        dietaryRestrictions: '',
        specialRequests: 'Wheelchair accessible seating',
      },
      {
        hashCode: 'COLLEGE8',
        phoneNumber: '+1-555-0105',
        partySize: 3,
        dietaryRestrictions: 'No shellfish allergies',
        specialRequests: '',
      },
      {
        hashCode: 'WORK2023',
        phoneNumber: '+1-555-0106',
        partySize: 2,
        dietaryRestrictions: 'Vegan',
        specialRequests: '',
      },
    ];

    // Update each guest with the additional data
    for (const update of guestUpdates) {
      await queryRunner.query(
        `
        UPDATE "guests" 
        SET 
          "phone_number" = ?,
          "party_size" = ?,
          "dietary_restrictions" = ?,
          "special_requests" = ?
        WHERE "hash_code" = ?
      `,
        [
          update.phoneNumber,
          update.partySize,
          update.dietaryRestrictions,
          update.specialRequests,
          update.hashCode,
        ],
      );
    }

    console.log('✅ Updated demo guests with additional data');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Reset the additional fields for demo guests
    const hashCodes = [
      'DEMO2024',
      'FAMILY01',
      'COUPLE99',
      'FRIEND42',
      'COLLEGE8',
      'WORK2023',
    ];

    for (const hashCode of hashCodes) {
      await queryRunner.query(
        `
        UPDATE "guests" 
        SET 
          "phone_number" = NULL,
          "party_size" = 1,
          "dietary_restrictions" = NULL,
          "special_requests" = NULL
        WHERE "hash_code" = ?
      `,
        [hashCode],
      );
    }
  }
}
