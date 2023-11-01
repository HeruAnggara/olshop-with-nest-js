-- AlterTable
ALTER TABLE `barang` ADD COLUMN `harga_diskon` FLOAT NULL;

-- CreateTable
CREATE TABLE `keranjang` (
    `id` VARCHAR(191) NOT NULL,
    `users_id` VARCHAR(191) NOT NULL,
    `barang_id` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `keranjang` ADD CONSTRAINT `keranjang_users_id_fkey` FOREIGN KEY (`users_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `keranjang` ADD CONSTRAINT `keranjang_barang_id_fkey` FOREIGN KEY (`barang_id`) REFERENCES `barang`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
