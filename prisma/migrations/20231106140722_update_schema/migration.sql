/*
  Warnings:

  - Added the required column `berat` to the `barang` table without a default value. This is not possible if the table is not empty.
  - Added the required column `alamat` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `no_wa` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `barang` ADD COLUMN `berat` FLOAT NOT NULL;

-- AlterTable
ALTER TABLE `users` ADD COLUMN `alamat` VARCHAR(191) NOT NULL,
    ADD COLUMN `no_wa` VARCHAR(191) NOT NULL;
