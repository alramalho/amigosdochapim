-- CreateEnum
CREATE TYPE "DonationType" AS ENUM ('ONE_OFF', 'SUBSCRIPTION');

-- AlterTable
ALTER TABLE "donations" ADD COLUMN "type" "DonationType" NOT NULL DEFAULT 'ONE_OFF';

-- AlterTable
ALTER TABLE "donations" ADD COLUMN "stripe_invoice_id" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "donations_stripe_invoice_id_key" ON "donations"("stripe_invoice_id");
