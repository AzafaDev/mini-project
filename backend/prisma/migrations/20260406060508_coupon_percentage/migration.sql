/*
  Warnings:

  - You are about to drop the column `discountValue` on the `Coupon` table. All the data in the column will be lost.
  - You are about to drop the column `minPurchase` on the `Coupon` table. All the data in the column will be lost.
  - Added the required column `discountPercentage` to the `Coupon` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Coupon" DROP COLUMN "discountValue",
DROP COLUMN "minPurchase",
ADD COLUMN     "discountPercentage" INTEGER NOT NULL;
