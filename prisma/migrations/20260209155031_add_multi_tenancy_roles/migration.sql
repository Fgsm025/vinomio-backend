-- CreateEnum
CREATE TYPE "Role" AS ENUM ('OWNER', 'ADMIN', 'FINANCE', 'AGRONOMIST', 'OPERATOR');

-- CreateTable
CREATE TABLE "user_exploitations" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "exploitation_id" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_exploitations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_exploitations_user_id_exploitation_id_key" ON "user_exploitations"("user_id", "exploitation_id");

-- AddForeignKey
ALTER TABLE "user_exploitations" ADD CONSTRAINT "user_exploitations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_exploitations" ADD CONSTRAINT "user_exploitations_exploitation_id_fkey" FOREIGN KEY ("exploitation_id") REFERENCES "exploitations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
