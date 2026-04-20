import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { KafkaConsumerService } from './consumer';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const configService = app.get(ConfigService);
  const logger = new Logger('ASRWorker');

  const consumer = app.get(KafkaConsumerService);

  logger.log('🚀 ASR Worker started - listening for transcription requests...');
  logger.log(`Environment: ${configService.get('NODE_ENV')}`);
  logger.log(`Model: ${configService.get('WHISPER_MODEL') || 'small'}`);

  // Graceful shutdown
  process.on('SIGTERM', async () => {
    logger.log('Shutting down ASR worker...');
    await consumer.disconnect();
    await app.close();
    process.exit(0);
  });
}

bootstrap().catch((err) => {
  console.error('❌ ASR Worker failed to start:', err);
  process.exit(1);
});