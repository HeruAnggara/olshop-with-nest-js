-- AlterTable
ALTER TABLE `konfirmasi` ADD COLUMN `status` BOOLEAN NOT NULL DEFAULT false,
    MODIFY `bukti` VARCHAR(191) NULL;
