/*
  Warnings:

  - Added the required column `kecamatan_id` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `kota_id` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `provinsi_id` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `users` ADD COLUMN `kecamatan_id` INTEGER NOT NULL,
    ADD COLUMN `kota_id` INTEGER NOT NULL,
    ADD COLUMN `provinsi_id` INTEGER NOT NULL;

-- CreateTable
CREATE TABLE `kota` (
    `city_id` INTEGER NOT NULL,
    `province_id` INTEGER NOT NULL,
    `city_name` VARCHAR(191) NULL,
    `postal_code` VARCHAR(191) NULL,

    PRIMARY KEY (`city_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `provinsi` (
    `province_id` INTEGER NOT NULL,
    `province_name` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`province_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `kecamatan` (
    `kecamatan_id` INTEGER NOT NULL,
    `city_id` INTEGER NOT NULL,
    `kecamatan_name` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`kecamatan_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `users` ADD CONSTRAINT `users_kota_id_fkey` FOREIGN KEY (`kota_id`) REFERENCES `kota`(`city_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `users` ADD CONSTRAINT `users_kecamatan_id_fkey` FOREIGN KEY (`kecamatan_id`) REFERENCES `kecamatan`(`kecamatan_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `users` ADD CONSTRAINT `users_provinsi_id_fkey` FOREIGN KEY (`provinsi_id`) REFERENCES `provinsi`(`province_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `kota` ADD CONSTRAINT `kota_province_id_fkey` FOREIGN KEY (`province_id`) REFERENCES `provinsi`(`province_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `kecamatan` ADD CONSTRAINT `kecamatan_city_id_fkey` FOREIGN KEY (`city_id`) REFERENCES `kota`(`city_id`) ON DELETE RESTRICT ON UPDATE CASCADE;
