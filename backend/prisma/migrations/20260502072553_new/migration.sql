/*
  Warnings:

  - A unique constraint covering the columns `[idempotencyKey]` on the table `Transaction` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "idempotencyKey" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_idempotencyKey_key" ON "Transaction"("idempotencyKey");

-- CreateIndex
CREATE INDEX "Transaction_createdAt_idx" ON "Transaction"("createdAt");

-- CreateIndex
CREATE INDEX "Transaction_eventId_status_idx" ON "Transaction"("eventId", "status");

-- CreateIndex
CREATE INDEX "Transaction_userId_eventId_idx" ON "Transaction"("userId", "eventId");

-- CreateIndex
CREATE INDEX "Voucher_eventId_isActive_startDate_endDate_idx" ON "Voucher"("eventId", "isActive", "startDate", "endDate");
