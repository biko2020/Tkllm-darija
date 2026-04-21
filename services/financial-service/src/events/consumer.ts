import { Kafka } from 'kafkajs';
import { config } from '../config/configuration';
import { checkVelocity } from '../fraud/rules/velocity.rule';
import { LedgerService } from '../wallet/ledger.service';

const kafka = new Kafka(config.kafka);
const consumer = kafka.consumer({ groupId: config.kafka.groupId });
const ledger = new LedgerService();

export const startConsumer = async () => {
  await consumer.connect();
  await consumer.subscribe({ topic: 'quality.review.completed', fromBeginning: false });

  await consumer.run({
    eachMessage: async ({ message }) => {
      const event = JSON.parse(message.value?.toString() || '{}');
      
      // 1. Check Fraud
      const isSafe = await checkVelocity(event.userId);
      if (!isSafe) {
        console.error(`Fraud Alert: Velocity limit exceeded for user ${event.userId}`);
        return;
      }

      // 2. Record in Ledger
      await ledger.recordTransaction({
        userId: event.userId,
        amount: event.rewardAmount,
        type: 'CREDIT',
        reference: `kafka-${message.offset}`
      });
      
      console.log(`✅ Credited ${event.rewardAmount} MAD to user ${event.userId}`);
    },
  });
};