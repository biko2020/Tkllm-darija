import { LedgerService } from './ledger.service';
import { FraudService } from '../fraud/fraud.service';

export class WalletService {
  constructor(
    private ledger: LedgerService,
    private fraud: FraudService
  ) {}

  async processPayout(userId: string, amount: number, context: any) {
    const isSafe = await this.fraud.evaluateTransaction(userId, context);
    if (!isSafe) throw new Error('FRAUD_ALERT');

    return await this.ledger.recordTransaction({
      userId,
      amount,
      type: 'DEBIT',
      reference: `payout_${Date.now()}`
    });
  }
}