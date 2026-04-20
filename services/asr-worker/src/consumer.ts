import { Injectable, OnModuleInit } from '@nestjs/common';
import { Kafka } from 'kafkajs';
import { ConfigService } from '@nestjs/config';
import { ProcessorService } from './processor';

@Injectable()
export class KafkaConsumerService implements OnModuleInit {
  private kafka: Kafka;
  private consumer: any;

  constructor(
    private configService: ConfigService,
    private processor: ProcessorService,
  ) {
    this.kafka = new Kafka({
      clientId: 'asr-worker',
      brokers: [this.configService.get<string>('KAFKA_BROKER')!],
    });

    this.consumer = this.kafka.consumer({ groupId: 'asr-workers' });
  }

  async onModuleInit() {
    await this.consumer.connect();
    await this.consumer.subscribe({ topic: 'transcription.requested', fromBeginning: false });

    await this.consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        const payload = JSON.parse(message.value.toString());
        await this.processor.processTranscriptionRequest(payload);
      },
    });
  }

  async disconnect() {
    await this.consumer.disconnect();
  }
}