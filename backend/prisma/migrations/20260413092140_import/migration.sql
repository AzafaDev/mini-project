/*
  Warnings:

  - A unique constraint covering the columns `[code,eventId]` on the table `Voucher` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Transaction" DROP CONSTRAINT "Transaction_ticketId_fkey";

-- DropIndex
DROP INDEX "Voucher_code_key";

-- AlterTable
ALTER TABLE "Transaction" ALTER COLUMN "ticketId" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Voucher_code_eventId_key" ON "Voucher"("code", "eventId");

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "Ticket"("id") ON DELETE SET NULL ON UPDATE CASCADE;
