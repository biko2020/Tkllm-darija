export abstract class BasePaymentProvider {
  abstract transfer(phone: string, amount: number): Promise<{
    txId: string;
    status: 'SUCCESS' | 'FAILED' | 'PENDING';
  }>;
}