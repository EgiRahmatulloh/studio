/*
  Warnings:

  - A unique constraint covering the columns `[config_date,posyandu_name]` on the table `attendance_configs` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `posyandu_name` to the `attendance_configs` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "public"."attendance_configs_config_date_key";

-- AlterTable
ALTER TABLE "public"."attendance_configs" ADD COLUMN     "posyandu_name" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "public"."examination_records" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "height" DOUBLE PRECISION NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL,
    "notes" TEXT,
    "posyandu_name" TEXT NOT NULL,
    "visitor_id" TEXT NOT NULL,

    CONSTRAINT "examination_records_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "attendance_configs_config_date_posyandu_name_key" ON "public"."attendance_configs"("config_date", "posyandu_name");

-- AddForeignKey
ALTER TABLE "public"."examination_records" ADD CONSTRAINT "examination_records_visitor_id_fkey" FOREIGN KEY ("visitor_id") REFERENCES "public"."visitors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
