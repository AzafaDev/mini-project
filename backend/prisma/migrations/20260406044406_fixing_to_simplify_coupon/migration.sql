/*
  Warnings:

  - You are about to drop the column `discountType` on the `Coupon` table. All the data in the column will be lost.
  - You are about to drop the column `maxDiscount` on the `Coupon` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Coupon" DROP COLUMN "discountType",
DROP COLUMN "maxDiscount";
