import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateGuestEntity1700000005000 implements MigrationInterface {
  name = 'UpdateGuestEntity1700000005000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Check if columns exist before adding them
    const table = await queryRunner.getTable('guests');

    if (!table?.findColumnByName('phone_number')) {
      await queryRunner.query(`
        ALTER TABLE "guests" 
        ADD COLUMN "phone_number" varchar(20)
      `);
    }

    if (!table?.findColumnByName('party_size')) {
      await queryRunner.query(`
        ALTER TABLE "guests" 
        ADD COLUMN "party_size" integer NOT NULL DEFAULT 1
      `);
    }

    if (!table?.findColumnByName('dietary_restrictions')) {
      await queryRunner.query(`
        ALTER TABLE "guests" 
        ADD COLUMN "dietary_restrictions" text
      `);
    }

    if (!table?.findColumnByName('special_requests')) {
      await queryRunner.query(`
        ALTER TABLE "guests" 
        ADD COLUMN "special_requests" text
      `);
    }

    console.log('✅ Updated guests table with missing fields');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove the added columns
    await queryRunner.query(`
      ALTER TABLE "guests" 
      DROP COLUMN "special_requests"
    `);

    await queryRunner.query(`
      ALTER TABLE "guests" 
      DROP COLUMN "dietary_restrictions"
    `);

    await queryRunner.query(`
      ALTER TABLE "guests" 
      DROP COLUMN "party_size"
    `);

    await queryRunner.query(`
      ALTER TABLE "guests" 
      DROP COLUMN "phone_number"
    `);
  }
}
