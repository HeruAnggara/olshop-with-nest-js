/*
  Warnings:

  - Added the required column `jumlah` to the `keranjang` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `keranjang` ADD COLUMN `jumlah` INTEGER NOT NULL;
