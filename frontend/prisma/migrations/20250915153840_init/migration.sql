-- CreateEnum
CREATE TYPE "public"."UploadStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

-- CreateTable
CREATE TABLE "public"."wedding_info" (
    "id" TEXT NOT NULL,
    "coupleNames" VARCHAR(100) NOT NULL,
    "presentationMessage" TEXT,
    "weddingAddress" VARCHAR(300),
    "weddingDate" DATE NOT NULL,
    "locationDirections" JSONB,
    "heroImageId" VARCHAR(255),
    "heroMessage" TEXT,
    "heroAddress" VARCHAR(200),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "wedding_info_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."admins" (
    "id" TEXT NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."csv_uploads" (
    "id" TEXT NOT NULL,
    "filename" VARCHAR(200) NOT NULL,
    "total_rows" INTEGER NOT NULL DEFAULT 0,
    "processed_rows" INTEGER NOT NULL DEFAULT 0,
    "error_rows" INTEGER NOT NULL DEFAULT 0,
    "status" "public"."UploadStatus" NOT NULL DEFAULT 'PENDING',
    "error_log" TEXT,
    "uploaded_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "csv_uploads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."guests" (
    "id" TEXT NOT NULL,
    "first_name" VARCHAR(50) NOT NULL,
    "last_name" VARCHAR(50) NOT NULL,
    "email" VARCHAR(255),
    "hash_code" VARCHAR(8) NOT NULL,
    "phone_number" VARCHAR(20),
    "party_size" INTEGER NOT NULL DEFAULT 1,
    "dietary_restrictions" TEXT,
    "special_requests" TEXT,
    "csv_upload_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "guests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."rsvp_confirmations" (
    "id" TEXT NOT NULL,
    "guest_id" TEXT NOT NULL,
    "confirmed_at" DATE NOT NULL,
    "ip_address" VARCHAR(45) NOT NULL,
    "user_agent" TEXT,
    "is_attending" BOOLEAN NOT NULL,
    "confirmed_party_size" INTEGER NOT NULL,
    "message" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rsvp_confirmations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."accommodations" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT NOT NULL,
    "address" VARCHAR(300) NOT NULL,
    "contact_info" VARCHAR(200),
    "latitude" DECIMAL(10,8),
    "longitude" DECIMAL(11,8),
    "price_range" VARCHAR(50),
    "is_recommended" BOOLEAN NOT NULL DEFAULT false,
    "display_order" INTEGER NOT NULL,
    "source_url" TEXT,
    "images_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "accommodations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."program_events" (
    "id" TEXT NOT NULL,
    "title" VARCHAR(100) NOT NULL,
    "description" TEXT NOT NULL,
    "start_time" DATE NOT NULL,
    "end_time" DATE NOT NULL,
    "location" VARCHAR(200) NOT NULL,
    "display_order" INTEGER NOT NULL,
    "include_in_calendar" BOOLEAN NOT NULL DEFAULT true,
    "icon" VARCHAR(50),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "program_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."uploaded_images" (
    "id" TEXT NOT NULL,
    "original_name" VARCHAR(200) NOT NULL,
    "filename" VARCHAR(200) NOT NULL,
    "mime_type" VARCHAR(50) NOT NULL,
    "size" INTEGER NOT NULL,
    "width" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    "alt_text" VARCHAR(200),
    "usage_location" VARCHAR(100) NOT NULL,
    "uploaded_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "uploaded_images_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "admins_email_key" ON "public"."admins"("email");

-- CreateIndex
CREATE UNIQUE INDEX "guests_hash_code_key" ON "public"."guests"("hash_code");

-- CreateIndex
CREATE UNIQUE INDEX "rsvp_confirmations_guest_id_key" ON "public"."rsvp_confirmations"("guest_id");

-- CreateIndex
CREATE UNIQUE INDEX "accommodations_display_order_key" ON "public"."accommodations"("display_order");

-- CreateIndex
CREATE UNIQUE INDEX "program_events_display_order_key" ON "public"."program_events"("display_order");

-- CreateIndex
CREATE UNIQUE INDEX "uploaded_images_filename_key" ON "public"."uploaded_images"("filename");

-- AddForeignKey
ALTER TABLE "public"."csv_uploads" ADD CONSTRAINT "csv_uploads_uploaded_by_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "public"."admins"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."guests" ADD CONSTRAINT "guests_csv_upload_id_fkey" FOREIGN KEY ("csv_upload_id") REFERENCES "public"."csv_uploads"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."rsvp_confirmations" ADD CONSTRAINT "rsvp_confirmations_guest_id_fkey" FOREIGN KEY ("guest_id") REFERENCES "public"."guests"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."uploaded_images" ADD CONSTRAINT "uploaded_images_uploaded_by_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "public"."admins"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
