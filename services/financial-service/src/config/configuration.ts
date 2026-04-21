import dotenv from 'dotenv';
dotenv.config();

export const config = {
  kafka: {
    brokers: process.env.KAFKA_BROKERS?.split(',') || ['localhost:9092'],
    clientId: 'financial-service',
    groupId: 'payout-consumers',
  },
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  },
  providers: {
    orangeMoney: {
      clientId: process.env.OM_CLIENT_ID,
      clientSecret: process.env.OM_CLIENT_SECRET,
      baseUrl: 'https://api.orange.com/orange-money-morocco/v1',
    },
    cmi: {
      merchantId: process.env.CMI_MERCHANT_ID,
      key: process.env.CMI_SECRET_KEY,
    }
  }
};