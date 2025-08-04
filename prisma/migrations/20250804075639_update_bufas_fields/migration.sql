/*
  Warnings:

  - You are about to drop the column `pengunjung_bufus` on the `activity_records` table. All the data in the column will be lost.
  - You are about to drop the column `sasaran_bufus` on the `activity_records` table. All the data in the column will be lost.
  - Added the required column `pengunjung_bufas` to the `activity_records` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sasaran_bufas` to the `activity_records` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "activity_records" DROP COLUMN "pengunjung_bufus",
DROP COLUMN "sasaran_bufus",
ADD COLUMN     "pengunjung_bufas" INTEGER NOT NULL,
ADD COLUMN     "sasaran_bufas" INTEGER NOT NULL;
