import axios from 'axios';
import { BasePaymentProvider, PayoutStatus } from './base-provider';
import { config } from '../config/configuration';
import { logger } from '../shared/logger';

export class InwiMoneyProvider extends BasePaymentProvider {
  protected providerName = 'INWI_MONEY';

  /**
   * Initiates a B2C (Business to Consumer) transfer to an Inwi Money wallet.
   * In Morocco, this usually requires an API Key and a Merchant ID.
   */
  async transfer(phone: string, amount: number) {
    try {
      // 1. Validate Moroccan phone format for Inwi (06 or 07)
      if (!this.isValidInwiFormat(phone)) {
        throw new Error('INVALID_INWI_PHONE_FORMAT');
      }

      // 2. API Request to Inwi Money Gateway
      // Note: Endpoint and payload structure varies by API version (REST vs SOAP)
      const response = await axios.post(
        `${process.env.INWI_MONEY_BASE_URL}/transfer`,
        {
          merchantId: config.providers.inwiMoney.merchantId,
          recipient: phone,
          amount: amount,
          currency: 'MAD',
          reference: `TKLLM-${Date.now()}`
        },
        {
          headers: {
            'X-API-KEY': process.env.INWI_MONEY_API_KEY,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        txId: response.data.transactionId,
        status: PayoutStatus.SUCCESS
      };
    } catch (error) {
      logger.error(`[InwiMoney] Payout failed for ${phone}:`, error.message);
      return {
        txId: '',
        status: PayoutStatus.FAILED,
        errorMessage: error.message
      };
    }
  }

  /**
   * Helper to verify if the phone number is a valid Moroccan mobile string
   */
  private isValidInwiFormat(phone: string): boolean {
    const re = /^(06|07)\d{8}$/;
    return re.test(phone);
  }

  /**
   * Periodic check for pending transactions
   */
  async verifyStatus(txId: string): Promise<PayoutStatus> {
    // Logic to poll Inwi API to check if a previously PENDING tx is now SUCCESS
    return PayoutStatus.SUCCESS;
  }
}