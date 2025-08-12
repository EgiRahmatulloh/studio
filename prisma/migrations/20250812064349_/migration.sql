-- CreateEnum
CREATE TYPE "public"."Role" AS ENUM ('ADMIN', 'USER');

-- CreateTable
CREATE TABLE "public"."activity_records" (
    "id" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "posyanduName" TEXT NOT NULL,
    "activity_date" TIMESTAMP(3) NOT NULL,
    "sasaran_balita" INTEGER NOT NULL,
    "sasaran_bumil" INTEGER NOT NULL,
    "sasaran_remaja" INTEGER NOT NULL,
    "sasaran_lansia" INTEGER NOT NULL,
    "sasaran_busu" INTEGER NOT NULL,
    "sasaran_bayi" INTEGER NOT NULL,
    "sasaran_dewasa" INTEGER NOT NULL,
    "pengunjung_balita" INTEGER NOT NULL,
    "pengunjung_bumil" INTEGER NOT NULL,
    "pengunjung_remaja" INTEGER NOT NULL,
    "pengunjung_lansia" INTEGER NOT NULL,
    "pengunjung_busu" INTEGER NOT NULL,
    "pengunjung_bayi" INTEGER NOT NULL,
    "pengunjung_dewasa" INTEGER NOT NULL,
    "foto_url" TEXT,
    "pengunjung_bufas" INTEGER NOT NULL,
    "sasaran_bufas" INTEGER NOT NULL,

    CONSTRAINT "activity_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."attendance_records" (
    "id" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "posyanduName" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "attendance_date" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "attendance_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "full_name" TEXT,
    "posyandu_name" TEXT,
    "password" TEXT NOT NULL,
    "role" "public"."Role" NOT NULL DEFAULT 'USER',
    "username" TEXT NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."permissions" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."_PermissionToUser" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_PermissionToUser_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "public"."users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "permissions_name_key" ON "public"."permissions"("name");

-- CreateIndex
CREATE INDEX "_PermissionToUser_B_index" ON "public"."_PermissionToUser"("B");

-- AddForeignKey
ALTER TABLE "public"."_PermissionToUser" ADD CONSTRAINT "_PermissionToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_PermissionToUser" ADD CONSTRAINT "_PermissionToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
