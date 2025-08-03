-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'USER');

-- CreateTable
CREATE TABLE "activity_records" (
    "id" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "posyanduName" TEXT NOT NULL,
    "activity_date" TIMESTAMP(3) NOT NULL,
    "sasaran_balita" INTEGER NOT NULL,
    "sasaran_bumil" INTEGER NOT NULL,
    "sasaran_remaja" INTEGER NOT NULL,
    "sasaran_lansia" INTEGER NOT NULL,
    "sasaran_bufus" INTEGER NOT NULL,
    "sasaran_busu" INTEGER NOT NULL,
    "sasaran_bayi" INTEGER NOT NULL,
    "sasaran_dewasa" INTEGER NOT NULL,
    "pengunjung_balita" INTEGER NOT NULL,
    "pengunjung_bumil" INTEGER NOT NULL,
    "pengunjung_remaja" INTEGER NOT NULL,
    "pengunjung_lansia" INTEGER NOT NULL,
    "pengunjung_bufus" INTEGER NOT NULL,
    "pengunjung_busu" INTEGER NOT NULL,
    "pengunjung_bayi" INTEGER NOT NULL,
    "pengunjung_dewasa" INTEGER NOT NULL,
    "total_sasaran" INTEGER NOT NULL,
    "total_pengunjung" INTEGER NOT NULL,
    "foto_url" TEXT,

    CONSTRAINT "activity_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attendance_records" (
    "id" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "posyanduName" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "attendance_date" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "attendance_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'USER',

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permissions" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_PermissionToUser" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_PermissionToUser_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "permissions_name_key" ON "permissions"("name");

-- CreateIndex
CREATE INDEX "_PermissionToUser_B_index" ON "_PermissionToUser"("B");

-- AddForeignKey
ALTER TABLE "_PermissionToUser" ADD CONSTRAINT "_PermissionToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PermissionToUser" ADD CONSTRAINT "_PermissionToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
