/*
  Warnings:

  - Added the required column `barang_id` to the `checkout` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `checkout` ADD COLUMN `barang_id` VARCHAR(191) NOT NULL;

-- AddForeignKey
ALTER TABLE `checkout` ADD CONSTRAINT `checkout_barang_id_fkey` FOREIGN KEY (`barang_id`) REFERENCES `barang`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
