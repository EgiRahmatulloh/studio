/*
  Warnings:

  - You are about to drop the column `total_pengunjung` on the `activity_records` table. All the data in the column will be lost.
  - You are about to drop the column `total_sasaran` on the `activity_records` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."activity_records" DROP COLUMN "total_pengunjung",
DROP COLUMN "total_sasaran";
