-- AlterTable
ALTER TABLE "slot_requests" ADD COLUMN     "approved_at" TIMESTAMP(3);

-- AddForeignKey
ALTER TABLE "slot_requests" ADD CONSTRAINT "slot_requests_id_fkey" FOREIGN KEY ("id") REFERENCES "parking_slots"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
