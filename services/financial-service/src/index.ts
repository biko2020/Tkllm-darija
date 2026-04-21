import { startConsumer } from './events/consumer';
import { logger } from './shared/logger';

async function bootstrap() {
  try {
    logger.info('💰 Financial Service starting...');
    await startConsumer();
    logger.info('🚀 Consumer is running and listening for payout events.');
  } catch (error) {
    logger.error('💥 Failed to start Financial Service:', error);
    process.exit(1);
  }
}

bootstrap();