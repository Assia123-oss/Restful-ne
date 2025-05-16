-- AlterTable
ALTER TABLE "User" ADD COLUMN     "is_verified" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "Otp" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "otp_code" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Otp_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Otp" ADD CONSTRAINT "Otp_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
