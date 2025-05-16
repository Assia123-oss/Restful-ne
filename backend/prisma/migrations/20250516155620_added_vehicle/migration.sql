-- CreateTable
CREATE TABLE "Vehicle" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "plate_number" TEXT NOT NULL,
    "vehicle_type" TEXT NOT NULL,
    "size" TEXT NOT NULL,
    "other_attributes" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Vehicle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SlotRequest" (
    "id" SERIAL NOT NULL,
    "vehicleId" INTEGER NOT NULL,
    "request_status" TEXT NOT NULL,

    CONSTRAINT "SlotRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Vehicle_plate_number_key" ON "Vehicle"("plate_number");

-- AddForeignKey
ALTER TABLE "Vehicle" ADD CONSTRAINT "Vehicle_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SlotRequest" ADD CONSTRAINT "SlotRequest_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
