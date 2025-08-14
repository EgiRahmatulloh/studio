-- AlterTable
ALTER TABLE "public"."stunting_records" ADD COLUMN     "arm_circumference" DOUBLE PRECISION,
ADD COLUMN     "head_circumference" DOUBLE PRECISION,
ADD COLUMN     "height_for_age_z_score" DOUBLE PRECISION,
ADD COLUMN     "weight_for_age_z_score" DOUBLE PRECISION,
ADD COLUMN     "weight_for_height_z_score" DOUBLE PRECISION;
