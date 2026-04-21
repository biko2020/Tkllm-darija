import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export class LedgerService {
  async recordTransaction(data: any) {
    return await prisma.$transaction(async (tx) => {
      // 1. Update User Balance
      const wallet = await tx.wallet.update({
        where: { userId: data.userId },
        data: { balance: { increment: data.amount } }
      });

      // 2. Create Audit Trail
      await tx.transaction.create({
        data: {
          walletId: wallet.id,
          amount: data.amount,
          type: data.type,
          reference: data.reference,
          status: 'COMPLETED'
        }
      });
    });
  }
}