-- AlterTable
ALTER TABLE "public"."program_events" ALTER COLUMN "start_time" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "end_time" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "public"."rsvp_confirmations" ALTER COLUMN "confirmed_at" SET DATA TYPE TIMESTAMP(3);
