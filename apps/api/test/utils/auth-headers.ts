import jwt from "jsonwebtoken";

/**
 * Generates a JWT for test requests.
 * @param payload - Custom claims (e.g., userId, roles)
 * @param expiresIn - Token expiration (default: 1h)
 */
export function generateTestJwt(
  payload: Record<string, any> = { userId: "test-user", roles: ["contributor"] },
  expiresIn: string = "1h"
): string {
  const secret = process.env.JWT_SECRET || "test-secret";

  return jwt.sign(payload, secret, { expiresIn });
}

/**
 * Returns Authorization header object for Supertest requests.
 * @param payload - Custom claims
 */
export function authHeader(
  payload: Record<string, any> = { userId: "test-user", roles: ["contributor"] }
): { Authorization: string } {
  const token = generateTestJwt(payload);
  return { Authorization: `Bearer ${token}` };
}
