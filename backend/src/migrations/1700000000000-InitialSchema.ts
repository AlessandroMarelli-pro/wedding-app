import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1700000000000 implements MigrationInterface {
  name = 'InitialSchema1700000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create admins table
    await queryRunner.query(`
      CREATE TABLE "admins" (
        "id" varchar PRIMARY KEY NOT NULL,
        "email" varchar(255) NOT NULL,
        "password_hash" varchar(255) NOT NULL,
        "created_at" datetime NOT NULL DEFAULT (datetime('now')),
        "updated_at" datetime NOT NULL DEFAULT (datetime('now')),
        CONSTRAINT "UQ_admins_email" UNIQUE ("email")
      )
    `);

    // Create wedding_info table
    await queryRunner.query(`
      CREATE TABLE "wedding_info" (
        "id" varchar PRIMARY KEY NOT NULL,
        "couple_names" varchar(100) NOT NULL,
        "presentation_message" text NOT NULL,
        "wedding_address" varchar(300) NOT NULL,
        "wedding_date" datetime NOT NULL,
        "location_directions" text NOT NULL,
        "created_at" datetime NOT NULL DEFAULT (datetime('now')),
        "updated_at" datetime NOT NULL DEFAULT (datetime('now'))
      )
    `);

    // Create accommodations table
    await queryRunner.query(`
      CREATE TABLE "accommodations" (
        "id" varchar PRIMARY KEY NOT NULL,
        "name" varchar(100) NOT NULL,
        "description" text NOT NULL,
        "address" varchar(300) NOT NULL,
        "contact_info" varchar(200),
        "latitude" decimal(10,8),
        "longitude" decimal(11,8),
        "price_range" varchar(50),
        "is_recommended" boolean NOT NULL DEFAULT (0),
        "display_order" integer NOT NULL,
        "created_at" datetime NOT NULL DEFAULT (datetime('now')),
        "updated_at" datetime NOT NULL DEFAULT (datetime('now')),
        CONSTRAINT "UQ_accommodations_display_order" UNIQUE ("display_order")
      )
    `);

    // Create csv_uploads table
    await queryRunner.query(`
      CREATE TABLE "csv_uploads" (
        "id" varchar PRIMARY KEY NOT NULL,
        "filename" varchar(200) NOT NULL,
        "total_rows" integer NOT NULL DEFAULT (0),
        "processed_rows" integer NOT NULL DEFAULT (0),
        "error_rows" integer NOT NULL DEFAULT (0),
        "status" varchar CHECK("status" IN ('pending','processing','completed','failed')) NOT NULL DEFAULT ('pending'),
        "error_log" text,
        "uploaded_by" varchar NOT NULL,
        "created_at" datetime NOT NULL DEFAULT (datetime('now')),
        "updated_at" datetime NOT NULL DEFAULT (datetime('now')),
        CONSTRAINT "FK_csv_uploads_uploaded_by" FOREIGN KEY ("uploaded_by") REFERENCES "admins" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION
      )
    `);

    // Create guests table
    await queryRunner.query(`
      CREATE TABLE "guests" (
        "id" varchar PRIMARY KEY NOT NULL,
        "first_name" varchar(50) NOT NULL,
        "last_name" varchar(50) NOT NULL,
        "email" varchar(255),
        "hash_code" varchar(8) NOT NULL,
        "csv_upload_id" varchar NOT NULL,
        "created_at" datetime NOT NULL DEFAULT (datetime('now')),
        "updated_at" datetime NOT NULL DEFAULT (datetime('now')),
        CONSTRAINT "UQ_guests_hash_code" UNIQUE ("hash_code"),
        CONSTRAINT "FK_guests_csv_upload_id" FOREIGN KEY ("csv_upload_id") REFERENCES "csv_uploads" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION
      )
    `);

    // Create rsvp_confirmations table
    await queryRunner.query(`
      CREATE TABLE "rsvp_confirmations" (
        "id" varchar PRIMARY KEY NOT NULL,
        "hash_code" varchar(8) NOT NULL,
        "guest_id" varchar NOT NULL,
        "confirmed_at" datetime NOT NULL,
        "ip_address" varchar(45) NOT NULL,
        "user_agent" text,
        CONSTRAINT "UQ_rsvp_confirmations_hash_code" UNIQUE ("hash_code"),
        CONSTRAINT "FK_rsvp_confirmations_guest_id" FOREIGN KEY ("guest_id") REFERENCES "guests" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION
      )
    `);

    // Create uploaded_images table
    await queryRunner.query(`
      CREATE TABLE "uploaded_images" (
        "id" varchar PRIMARY KEY NOT NULL,
        "original_name" varchar(200) NOT NULL,
        "filename" varchar(200) NOT NULL,
        "mime_type" varchar(50) NOT NULL,
        "size" integer NOT NULL,
        "width" integer NOT NULL,
        "height" integer NOT NULL,
        "alt_text" varchar(200),
        "usage_location" varchar(100) NOT NULL,
        "uploaded_by" varchar NOT NULL,
        "created_at" datetime NOT NULL DEFAULT (datetime('now')),
        "updated_at" datetime NOT NULL DEFAULT (datetime('now')),
        CONSTRAINT "UQ_uploaded_images_filename" UNIQUE ("filename"),
        CONSTRAINT "FK_uploaded_images_uploaded_by" FOREIGN KEY ("uploaded_by") REFERENCES "admins" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION
      )
    `);

    // Create indexes for better performance
    await queryRunner.query(
      `CREATE INDEX "IDX_guests_hash_code" ON "guests" ("hash_code")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_guests_csv_upload_id" ON "guests" ("csv_upload_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_rsvp_confirmations_confirmed_at" ON "rsvp_confirmations" ("confirmed_at")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_accommodations_is_recommended_display_order" ON "accommodations" ("is_recommended", "display_order")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(
      `DROP INDEX "IDX_accommodations_is_recommended_display_order"`,
    );
    await queryRunner.query(`DROP INDEX "IDX_rsvp_confirmations_confirmed_at"`);
    await queryRunner.query(`DROP INDEX "IDX_guests_csv_upload_id"`);
    await queryRunner.query(`DROP INDEX "IDX_guests_hash_code"`);

    // Drop tables in reverse order
    await queryRunner.query(`DROP TABLE "uploaded_images"`);
    await queryRunner.query(`DROP TABLE "rsvp_confirmations"`);
    await queryRunner.query(`DROP TABLE "guests"`);
    await queryRunner.query(`DROP TABLE "csv_uploads"`);
    await queryRunner.query(`DROP TABLE "accommodations"`);
    await queryRunner.query(`DROP TABLE "wedding_info"`);
    await queryRunner.query(`DROP TABLE "admins"`);
  }
}
