-- CreateTable
CREATE TABLE `barang` (
    `id` VARCHAR(191) NOT NULL,
    `nama_produk` VARCHAR(191) NOT NULL,
    `harga` FLOAT NOT NULL,
    `gambar` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `kategori` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_barangTokategori` (
    `A` VARCHAR(191) NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_barangTokategori_AB_unique`(`A`, `B`),
    INDEX `_barangTokategori_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `_barangTokategori` ADD CONSTRAINT `_barangTokategori_A_fkey` FOREIGN KEY (`A`) REFERENCES `barang`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_barangTokategori` ADD CONSTRAINT `_barangTokategori_B_fkey` FOREIGN KEY (`B`) REFERENCES `kategori`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
