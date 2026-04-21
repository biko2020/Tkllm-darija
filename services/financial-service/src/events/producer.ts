import { Kafka } from 'kafkajs';
import { config } from '../config/configuration';

const kafka = new Kafka(config.kafka);
const producer = kafka.producer();

export const publishPayoutEvent = async (payload: any) => {
  await producer.connect();
  await producer.send({
    topic: 'financial.payout.executed',
    messages: [{ value: JSON.stringify(payload) }],
  });
};