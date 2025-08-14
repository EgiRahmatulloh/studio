-- CreateTable
CREATE TABLE "public"."children" (
    "id" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "date_of_birth" TIMESTAMP(3) NOT NULL,
    "gender" TEXT NOT NULL,
    "posyandu_name" TEXT NOT NULL,

    CONSTRAINT "children_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."stunting_records" (
    "id" TEXT NOT NULL,
    "child_id" TEXT NOT NULL,
    "height" DOUBLE PRECISION NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL,
    "measurement_date" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stunting_records_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."stunting_records" ADD CONSTRAINT "stunting_records_child_id_fkey" FOREIGN KEY ("child_id") REFERENCES "public"."children"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
