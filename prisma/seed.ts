import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // No-op seed.
  // Workflows are now farm-scoped (`workflow.farmId` is mandatory), so
  // templates must be created during farm onboarding (where farmId exists).
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
