import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Utility to truncate all tables between tests.
 * Ensures a clean DB state for E2E and integration tests.
 */
export async function resetDatabase() {
  // Disable foreign key checks temporarily
  await prisma.$executeRawUnsafe(`SET session_replication_role = 'replica';`);

  // List of tables to truncate (adjust based on your schema)
  const tables = [
    "User",
    "Sample",
    "Task",
    "QualityReview",
    "Payment",
    "Wallet"
  ];

  for (const table of tables) {
    await prisma.$executeRawUnsafe(`TRUNCATE TABLE "${table}" RESTART IDENTITY CASCADE;`);
  }

  // Re-enable foreign key checks
  await prisma.$executeRawUnsafe(`SET session_replication_role = 'origin';`);
}

/**
 * Hook for Jest: call beforeEach/afterEach in E2E tests
 */
export async function cleanDbBeforeEach() {
  await resetDatabase();
}
