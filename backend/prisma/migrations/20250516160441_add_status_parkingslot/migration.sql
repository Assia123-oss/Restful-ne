-- CreateTable
CREATE TABLE "ParkingSlot" (
    "id" SERIAL NOT NULL,
    "slot_number" TEXT NOT NULL,
    "size" TEXT NOT NULL,
    "vehicle_type" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'available',

    CONSTRAINT "ParkingSlot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ParkingSlot_slot_number_key" ON "ParkingSlot"("slot_number");
