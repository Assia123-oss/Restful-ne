/*
  Warnings:

  - You are about to drop the `Log` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Otp` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ParkingSlot` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SlotRequest` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Vehicle` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Log" DROP CONSTRAINT "Log_userId_fkey";

-- DropForeignKey
ALTER TABLE "Otp" DROP CONSTRAINT "Otp_userId_fkey";

-- DropForeignKey
ALTER TABLE "SlotRequest" DROP CONSTRAINT "SlotRequest_vehicleId_fkey";

-- DropForeignKey
ALTER TABLE "Vehicle" DROP CONSTRAINT "Vehicle_userId_fkey";

-- DropTable
DROP TABLE "Log";

-- DropTable
DROP TABLE "Otp";

-- DropTable
DROP TABLE "ParkingSlot";

-- DropTable
DROP TABLE "SlotRequest";

-- DropTable
DROP TABLE "User";

-- DropTable
DROP TABLE "Vehicle";

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "role" TEXT NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "otp" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "otp_code" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "otp_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "logs" (
    "id" SERIAL NOT NULL,
    "action" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicles" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "plate_number" TEXT NOT NULL,
    "vehicle_type" TEXT NOT NULL,
    "size" TEXT NOT NULL,
    "other_attributes" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vehicles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "slot_requests" (
    "id" SERIAL NOT NULL,
    "vehicleId" INTEGER NOT NULL,
    "request_status" TEXT NOT NULL,

    CONSTRAINT "slot_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "parking_slots" (
    "id" SERIAL NOT NULL,
    "slot_number" TEXT NOT NULL,
    "size" TEXT NOT NULL,
    "vehicle_type" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'available',

    CONSTRAINT "parking_slots_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "vehicles_plate_number_key" ON "vehicles"("plate_number");

-- CreateIndex
CREATE UNIQUE INDEX "parking_slots_slot_number_key" ON "parking_slots"("slot_number");

-- AddForeignKey
ALTER TABLE "otp" ADD CONSTRAINT "otp_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "logs" ADD CONSTRAINT "logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "slot_requests" ADD CONSTRAINT "slot_requests_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "vehicles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
