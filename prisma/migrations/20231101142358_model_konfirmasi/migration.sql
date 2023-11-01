-- CreateTable
CREATE TABLE `konfirmasi` (
    `id` VARCHAR(191) NOT NULL,
    `users_id` VARCHAR(191) NOT NULL,
    `checkout_id` VARCHAR(191) NOT NULL,
    `bukti` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `konfirmasi` ADD CONSTRAINT `konfirmasi_users_id_fkey` FOREIGN KEY (`users_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `konfirmasi` ADD CONSTRAINT `konfirmasi_checkout_id_fkey` FOREIGN KEY (`checkout_id`) REFERENCES `checkout`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
