-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "return_reason" TEXT,
ADD COLUMN     "returned_at" TIMESTAMP(3);
