-- AlterTable
ALTER TABLE "public"."attendance_records" ADD COLUMN     "activityId" TEXT;

-- AddForeignKey
ALTER TABLE "public"."attendance_records" ADD CONSTRAINT "attendance_records_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "public"."activity_records"("id") ON DELETE SET NULL ON UPDATE CASCADE;
