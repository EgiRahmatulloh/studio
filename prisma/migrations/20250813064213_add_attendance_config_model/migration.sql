/*
  Warnings:

  - You are about to drop the column `activityId` on the `attendance_records` table. All the data in the column will be lost.
  - Added the required column `schedule_id` to the `attendance_records` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."attendance_records" DROP CONSTRAINT "attendance_records_activityId_fkey";

-- AlterTable
ALTER TABLE "public"."attendance_records" DROP COLUMN "activityId",
ADD COLUMN     "schedule_id" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "public"."attendance_schedules" (
    "id" TEXT NOT NULL,
    "schedule_date" TIMESTAMP(3) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "attendance_schedules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."attendance_configs" (
    "id" TEXT NOT NULL,
    "config_date" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "attendance_configs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "attendance_schedules_schedule_date_key" ON "public"."attendance_schedules"("schedule_date");

-- CreateIndex
CREATE UNIQUE INDEX "attendance_configs_config_date_key" ON "public"."attendance_configs"("config_date");

-- AddForeignKey
ALTER TABLE "public"."attendance_records" ADD CONSTRAINT "attendance_records_schedule_id_fkey" FOREIGN KEY ("schedule_id") REFERENCES "public"."attendance_schedules"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
