/*
  Warnings:

  - You are about to drop the column `foto_ktp` on the `verifikasi_koordinator` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "verifikasi_koordinator" DROP COLUMN "foto_ktp",
ADD COLUMN     "kabupaten" TEXT DEFAULT '';
