/*
  Warnings:

  - You are about to drop the column `pengunjung_busu` on the `activity_records` table. All the data in the column will be lost.
  - You are about to drop the column `sasaran_busu` on the `activity_records` table. All the data in the column will be lost.
  - Added the required column `pengunjung_busui` to the `activity_records` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sasaran_busui` to the `activity_records` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."activity_records" DROP COLUMN "pengunjung_busu",
DROP COLUMN "sasaran_busu",
ADD COLUMN     "pengunjung_busui" INTEGER NOT NULL,
ADD COLUMN     "sasaran_busui" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "public"."users" ADD COLUMN     "photo_url" TEXT;
