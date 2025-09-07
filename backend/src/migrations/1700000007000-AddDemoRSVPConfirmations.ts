import { MigrationInterface, QueryRunner } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

export class AddDemoRSVPConfirmations1700000007000
  implements MigrationInterface
{
  name = 'AddDemoRSVPConfirmations1700000007000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Get the guest IDs for our demo guests
    const guestHashCodes = ['DEMO2024', 'FAMILY01', 'COUPLE99', 'COLLEGE8'];
    const guests = [];

    for (const hashCode of guestHashCodes) {
      const result = await queryRunner.query(
        `SELECT "id" FROM "guests" WHERE "hash_code" = ?`,
        [hashCode],
      );
      if (result.length > 0) {
        guests.push({ hashCode, id: result[0].id });
      }
    }

    // Create sample RSVP confirmations for some guests
    const rsvpConfirmations = [
      {
        id: uuidv4(),
        guestId: guests.find((g) => g.hashCode === 'DEMO2024')?.id,
        isAttending: true,
        confirmedPartySize: 2,
        message:
          "So excited to celebrate with you both! Can't wait for the big day.",
        confirmedAt: new Date('2024-05-01T10:30:00Z').toISOString(),
        ipAddress: '192.168.1.100',
        userAgent:
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      {
        id: uuidv4(),
        guestId: guests.find((g) => g.hashCode === 'FAMILY01')?.id,
        isAttending: true,
        confirmedPartySize: 4,
        message:
          'The whole family is looking forward to it. Thank you for including us!',
        confirmedAt: new Date('2024-05-03T14:15:00Z').toISOString(),
        ipAddress: '192.168.1.101',
        userAgent:
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      },
      {
        id: uuidv4(),
        guestId: guests.find((g) => g.hashCode === 'COUPLE99')?.id,
        isAttending: false,
        confirmedPartySize: 0,
        message:
          "Unfortunately we won't be able to make it due to a prior commitment. Wishing you both all the best!",
        confirmedAt: new Date('2024-05-05T09:45:00Z').toISOString(),
        ipAddress: '192.168.1.102',
        userAgent:
          'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15',
      },
      {
        id: uuidv4(),
        guestId: guests.find((g) => g.hashCode === 'COLLEGE8')?.id,
        isAttending: true,
        confirmedPartySize: 3,
        message: "Wouldn't miss it for the world! See you there.",
        confirmedAt: new Date('2024-05-07T16:20:00Z').toISOString(),
        ipAddress: '192.168.1.103',
        userAgent:
          'Mozilla/5.0 (Android 13; Mobile; rv:109.0) Gecko/117.0 Firefox/117.0',
      },
    ];

    // Insert RSVP confirmations
    for (const rsvp of rsvpConfirmations) {
      if (rsvp.guestId) {
        await queryRunner.query(
          `
          INSERT INTO "rsvp_confirmations" (
            "id", "guest_id", "is_attending", "confirmed_party_size", 
            "message", "confirmed_at", "ip_address", "user_agent",
            "created_at", "updated_at"
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
        `,
          [
            rsvp.id,
            rsvp.guestId,
            rsvp.isAttending ? 1 : 0,
            rsvp.confirmedPartySize,
            rsvp.message,
            rsvp.confirmedAt,
            rsvp.ipAddress,
            rsvp.userAgent,
          ],
        );
      }
    }

    console.log('✅ Added demo RSVP confirmations');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove demo RSVP confirmations
    const guestHashCodes = ['DEMO2024', 'FAMILY01', 'COUPLE99', 'COLLEGE8'];

    for (const hashCode of guestHashCodes) {
      const result = await queryRunner.query(
        `SELECT "id" FROM "guests" WHERE "hash_code" = ?`,
        [hashCode],
      );
      if (result.length > 0) {
        await queryRunner.query(
          `DELETE FROM "rsvp_confirmations" WHERE "guest_id" = ?`,
          [result[0].id],
        );
      }
    }
  }
}
