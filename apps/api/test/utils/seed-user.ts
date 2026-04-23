import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

/**
 * Seeds a test user into the database and returns both the user record and a JWT.
 * @param overrides - Optional fields to override defaults (email, role, etc.)
 */
export async function seedTestUser(
  overrides: Partial<{ email: string; role: string; passwordHash: string }> = {}
) {
  const email = overrides.email || "testuser@example.com";
  const role = overrides.role || "contributor";
  const passwordHash = overrides.passwordHash || "hashed-password"; // adjust if your schema requires bcrypt

  // Create user in DB
  const user = await prisma.user.create({
    data: {
      email,
      role,
      passwordHash,
    },
  });

  // Generate JWT
  const secret = process.env.JWT_SECRET || "test-secret";
  const token = jwt.sign(
    { userId: user.id, roles: [role] },
    secret,
    { expiresIn: "1h" }
  );

  return { user, token };
}

/**
 * Seeds multiple users for test scenarios.
 */
export async function seedUsers(count: number = 5) {
  const users = [];
  for (let i = 0; i < count; i++) {
    users.push(await seedTestUser({ email: `user${i}@example.com` }));
  }
  return users;
}
