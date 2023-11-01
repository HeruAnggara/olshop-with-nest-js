-- CreateTable
CREATE TABLE `checkout` (
    `id` VARCHAR(191) NOT NULL,
    `users_id` VARCHAR(191) NOT NULL,
    `total` FLOAT NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `checkout` ADD CONSTRAINT `checkout_users_id_fkey` FOREIGN KEY (`users_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
