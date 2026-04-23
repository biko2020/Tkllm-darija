import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Seeds a wallet for a given user.
 * @param userId - ID of the user
 * @param balance - Initial wallet balance
 */
export async function seedWallet(userId: string, balance: number = 100) {
  const wallet = await prisma.wallet.create({
    data: {
      userId,
      balance,
      createdAt: new Date(),
    },
  });
  return wallet;
}

/**
 * Seeds a payment transaction for a given user.
 * @param userId - ID of the user
 * @param overrides - Optional fields to override defaults
 */
export async function seedPayment(
  userId: string,
  overrides: Partial<{ amount: number; status: string; type: string }> = {}
) {
  const amount = overrides.amount ?? 50;
  const status = overrides.status || "completed";
  const type = overrides.type || "payout";

  const payment = await prisma.payment.create({
    data: {
      userId,
      amount,
      status,
      type,
      createdAt: new Date(),
    },
  });

  return payment;
}

/**
 * Seeds multiple payments for a given user.
 */
export async function seedPayments(userId: string, count: number = 3) {
  const payments = [];
  for (let i = 0; i < count; i++) {
    payments.push(
      await seedPayment(userId, {
        amount: 20 + i * 10,
        type: "payout",
      })
    );
  }
  return payments;
}
