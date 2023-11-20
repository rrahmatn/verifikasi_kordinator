-- DropIndex
DROP INDEX "verifikasi_koordinator_nik_key";

-- AlterTable
ALTER TABLE "verifikasi_koordinator" ALTER COLUMN "status" SET DEFAULT 'belum terverifikasi';
