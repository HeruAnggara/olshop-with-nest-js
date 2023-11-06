/*
  Warnings:

  - Added the required column `ongkir` to the `checkout` table without a default value. This is not possible if the table is not empty.
  - Added the required column `total_transaksi` to the `konfirmasi` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `checkout` ADD COLUMN `ongkir` FLOAT NOT NULL;

-- AlterTable
ALTER TABLE `konfirmasi` ADD COLUMN `total_transaksi` FLOAT NOT NULL;
