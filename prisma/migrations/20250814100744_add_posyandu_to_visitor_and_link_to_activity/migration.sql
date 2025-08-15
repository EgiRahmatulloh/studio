-- CreateTable
CREATE TABLE "public"."visitors" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL,
    "birth_date" TIMESTAMP(3) NOT NULL,
    "gender" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "posyandu_name" TEXT NOT NULL,
    "activity_record_id" TEXT,

    CONSTRAINT "visitors_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."visitors" ADD CONSTRAINT "visitors_activity_record_id_fkey" FOREIGN KEY ("activity_record_id") REFERENCES "public"."activity_records"("id") ON DELETE SET NULL ON UPDATE CASCADE;
