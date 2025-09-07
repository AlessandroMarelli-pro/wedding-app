import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateRSVPConfirmationEntity1700000004000
  implements MigrationInterface
{
  name = 'UpdateRSVPConfirmationEntity1700000004000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('rsvp_confirmations');

    // Remove hash_code column if it exists (SQLite requires table recreation for constrained columns)
    if (table?.findColumnByName('hash_code')) {
      // Create backup table with new structure
      await queryRunner.query(`
        CREATE TABLE "rsvp_confirmations_new" (
          "id" varchar PRIMARY KEY NOT NULL,
          "guest_id" varchar NOT NULL,
          "confirmed_at" datetime NOT NULL,
          "ip_address" varchar(45) NOT NULL,
          "user_agent" text,
          "created_at" datetime NOT NULL DEFAULT (datetime('now')),
          "updated_at" datetime NOT NULL DEFAULT (datetime('now')),
          CONSTRAINT "UQ_rsvp_confirmations_guest_id" UNIQUE ("guest_id"),
          CONSTRAINT "FK_rsvp_confirmations_guest_id" FOREIGN KEY ("guest_id") REFERENCES "guests" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        )
      `);

      // Copy existing data (excluding hash_code)
      await queryRunner.query(`
        INSERT INTO "rsvp_confirmations_new" ("id", "guest_id", "confirmed_at", "ip_address", "user_agent", "created_at", "updated_at")
        SELECT "id", "guest_id", "confirmed_at", "ip_address", "user_agent", datetime('now'), datetime('now')
        FROM "rsvp_confirmations"
      `);

      // Drop old table and rename new one
      await queryRunner.query(`DROP TABLE "rsvp_confirmations"`);
      await queryRunner.query(
        `ALTER TABLE "rsvp_confirmations_new" RENAME TO "rsvp_confirmations"`,
      );
    }

    // Add missing columns to rsvp_confirmations table
    if (!table?.findColumnByName('is_attending')) {
      await queryRunner.query(`
        ALTER TABLE "rsvp_confirmations" 
        ADD COLUMN "is_attending" boolean NOT NULL DEFAULT 1
      `);
    }

    if (!table?.findColumnByName('confirmed_party_size')) {
      await queryRunner.query(`
        ALTER TABLE "rsvp_confirmations" 
        ADD COLUMN "confirmed_party_size" integer NOT NULL DEFAULT 1
      `);
    }

    if (!table?.findColumnByName('message')) {
      await queryRunner.query(`
        ALTER TABLE "rsvp_confirmations" 
        ADD COLUMN "message" text
      `);
    }

    // Update existing confirmations with default values
    // Set all existing confirmations as attending with party size 1 and a default message
    await queryRunner.query(`
      UPDATE "rsvp_confirmations" 
      SET 
        "is_attending" = COALESCE("is_attending", 1),
        "confirmed_party_size" = COALESCE("confirmed_party_size", 1),
        "message" = COALESCE("message", 'Thank you for your RSVP confirmation!')
      WHERE "is_attending" IS NULL OR "confirmed_party_size" IS NULL
    `);

    console.log(
      '✅ Updated RSVP confirmation table with missing fields and populated existing data',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove the added columns
    await queryRunner.query(`
      ALTER TABLE "rsvp_confirmations" 
      DROP COLUMN "message"
    `);

    await queryRunner.query(`
      ALTER TABLE "rsvp_confirmations" 
      DROP COLUMN "confirmed_party_size"
    `);

    await queryRunner.query(`
      ALTER TABLE "rsvp_confirmations" 
      DROP COLUMN "is_attending"
    `);
  }
}
