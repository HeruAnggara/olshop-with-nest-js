/*
  Warnings:

  - Added the required column `nama` to the `admin` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `admin` ADD COLUMN `nama` VARCHAR(191) NOT NULL;
