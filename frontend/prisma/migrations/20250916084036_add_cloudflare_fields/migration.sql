-- AlterTable
ALTER TABLE "public"."uploaded_images" ADD COLUMN     "cloudflare_key" VARCHAR(500),
ADD COLUMN     "cloudflare_url" VARCHAR(500);
