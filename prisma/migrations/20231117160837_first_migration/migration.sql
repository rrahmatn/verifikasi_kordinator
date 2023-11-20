-- CreateTable
CREATE TABLE "verifikasi_koordinator" (
    "id" SERIAL NOT NULL,
    "nik" TEXT NOT NULL,
    "nama" TEXT,
    "telepon" TEXT,
    "kabupaten" TEXT,
    "kecamatan" TEXT,
    "desa" TEXT,
    "rw" TEXT,
    "rt" TEXT,
    "tps" TEXT,
    "status" TEXT NOT NULL DEFAULT 'unverified',
    "foto_ktp" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "verifikasi_koordinator_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "verifikasi_koordinator_nik_key" ON "verifikasi_koordinator"("nik");
