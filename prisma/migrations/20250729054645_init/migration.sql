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
