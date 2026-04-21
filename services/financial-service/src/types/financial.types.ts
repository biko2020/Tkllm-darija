export enum PayoutStatus {
  PENDING = 'PENDING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  REJECTED_FRAUD = 'REJECTED_FRAUD'
}

export interface WalletTransaction {
  userId: string;
  amount: number;
  type: 'CREDIT' | 'DEBIT';
  reference: string; // Kafka message offset or provider TxID
}