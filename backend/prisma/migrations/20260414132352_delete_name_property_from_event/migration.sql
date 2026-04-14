/*
  Warnings:

  - You are about to drop the column `name` on the `Ticket` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "TicketType" AS ENUM ('GENERAL', 'VIP');

-- AlterTable
ALTER TABLE "Ticket" DROP COLUMN "name",
ADD COLUMN     "type" "TicketType" NOT NULL DEFAULT 'GENERAL';
