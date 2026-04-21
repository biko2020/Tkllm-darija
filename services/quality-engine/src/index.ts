/**
 * index.ts — Quality Engine Service Entry Point
 *
 * Bootstrap file for the Quality Scoring & Active Learning Worker.
 * Listens to Kafka topic 'quality.review.requested' and processes submissions.
 */

import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import { KafkaConsumerService } from './consumer';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const configService = app.get(ConfigService);
  const logger = new Logger('QualityEngine');

  const consumer = app.get(KafkaConsumerService);

  logger.log('🚀 Quality Engine started');
  logger.log(`Environment: ${configService.get('NODE_ENV') || 'development'}`);
  logger.log(`Listening on Kafka topic: quality.review.requested`);

  // Graceful shutdown
  process.on('SIGTERM', async () => {
    logger.log('Shutting down Quality Engine...');
    await consumer.disconnect();
    await app.close();
    process.exit(0);
  });

  process.on('SIGINT', async () => {
    logger.log('Received SIGINT. Shutting down...');
    await consumer.disconnect();
    await app.close();
    process.exit(0);
  });
}

bootstrap().catch((err) => {
  console.error('❌ Quality Engine failed to start:', err);
  process.exit(1);
});