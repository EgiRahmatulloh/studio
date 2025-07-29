-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'USER');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'USER',

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Permission" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Permission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AttendanceRecord" (
    "id" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "posyanduName" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "attendanceDate" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AttendanceRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivityRecord" (
    "id" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "posyanduName" TEXT NOT NULL,
    "activityDate" TIMESTAMP(3) NOT NULL,
    "sasaranBalita" INTEGER NOT NULL,
    "sasaranBumil" INTEGER NOT NULL,
    "sasaranRemaja" INTEGER NOT NULL,
    "sasaranLansia" INTEGER NOT NULL,
    "sasaranBufas" INTEGER NOT NULL,
    "sasaranBusu" INTEGER NOT NULL,
    "sasaranBayi" INTEGER NOT NULL,
    "sasaranDewasa" INTEGER NOT NULL,
    "pengunjungBalita" INTEGER NOT NULL,
    "pengunjungBumil" INTEGER NOT NULL,
    "pengunjungRemaja" INTEGER NOT NULL,
    "pengunjungLansia" INTEGER NOT NULL,
    "pengunjungBufas" INTEGER NOT NULL,
    "pengunjungBusu" INTEGER NOT NULL,
    "pengunjungBayi" INTEGER NOT NULL,
    "pengunjungDewasa" INTEGER NOT NULL,
    "totalSasaran" INTEGER NOT NULL,
    "totalPengunjung" INTEGER NOT NULL,
    "fotoUrl" TEXT,

    CONSTRAINT "ActivityRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_PermissionToUser" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Permission_name_key" ON "Permission"("name");

-- CreateIndex
CREATE UNIQUE INDEX "_PermissionToUser_AB_unique" ON "_PermissionToUser"("A", "B");

-- CreateIndex
CREATE INDEX "_PermissionToUser_B_index" ON "_PermissionToUser"("B");

-- AddForeignKey
ALTER TABLE "_PermissionToUser" ADD CONSTRAINT "_PermissionToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "Permission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PermissionToUser" ADD CONSTRAINT "_PermissionToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
