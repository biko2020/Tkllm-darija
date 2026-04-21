import { Injectable, OnModuleInit } from '@nestjs/common';
import { Kafka } from 'kafkajs';
import { ConfigService } from '@nestjs/config';
import { QualityScorer } from './scorer';

@Injectable()
export class KafkaConsumerService implements OnModuleInit {
  private kafka: Kafka;
  private consumer: any;

  constructor(
    private configService: ConfigService,
    private scorer: QualityScorer,
  ) {
    this.kafka = new Kafka({
      clientId: 'quality-engine',
      brokers: [this.configService.get<string>('KAFKA_BROKER')!],
    });

    this.consumer = this.kafka.consumer({ groupId: 'quality-engine-group' });
  }

  async onModuleInit() {
    await this.consumer.connect();
    await this.consumer.subscribe({ 
      topic: 'quality.review.requested', 
      fromBeginning: false 
    });

    await this.consumer.run({
      eachMessage: async ({ message }) => {
        const payload = JSON.parse(message.value.toString());
        await this.scorer.processQualityReview(payload);
      },
    });
  }

  async disconnect() {
    await this.consumer.disconnect();
  }
}