/**
 * main.ts — Tkllm-darija API Entry Point
 *
 * This is the bootstrap file for the NestJS backend.
 * It sets up global configurations, middleware, validation, Swagger, and starts the HTTP server.
 */

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { Logger } from '@nestjs/common';
import helmet from 'helmet';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug'], // Adjust in production
    bufferLogs: true,
  });

  const configService = app.get(ConfigService);
  const logger = new Logger('Bootstrap');
  const port = configService.get<number>('API_PORT') || 3000;
  const environment = configService.get<string>('NODE_ENV') || 'development';

  // ======================
  // Security Middleware
  // ======================
  app.use(helmet({
    contentSecurityPolicy: environment === 'production',
    crossOriginEmbedderPolicy: environment === 'production',
  }));

  // ======================
  // Global Settings
  // ======================
  app.setGlobalPrefix('api/v1');

  // Global Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,           // Strip properties without decorators
      forbidNonWhitelisted: true,
      transform: true,           // Auto-transform payloads to DTO instances
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Global Exception Filter
  app.useGlobalFilters(new AllExceptionsFilter());

  // Global Interceptors
  app.useGlobalInterceptors(
    new LoggingInterceptor(),
    new TransformInterceptor(),
  );

  // Enable CORS
  app.enableCors({
    origin: configService.get<string>('CORS_ORIGINS')?.split(',') || [
      'http://localhost:3001',   // web-contributor
      'http://localhost:3002',   // web-b2b
      'http://localhost:3000',   // for development
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  });

  // ======================
  // Swagger / OpenAPI Setup
  // ======================
  if (environment !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('Tkllm-darija API')
      .setDescription('Crowdsourced Moroccan Darija Data Factory API')
      .setVersion('0.1.0')
      .addTag('auth', 'Authentication & Authorization')
      .addTag('users', 'User management')
      .addTag('tasks', 'Task engine and assignments')
      .addTag('submissions', 'Audio submissions and transcriptions')
      .addTag('quality', 'Quality scoring and review')
      .addTag('payment', 'Wallet and payout system')
      .addTag('data', 'Dataset management')
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
      },
    });

    logger.log(`📄 Swagger UI available at http://localhost:${port}/api/docs`);
  }

  // ======================
  // Start Server
  // ======================
  await app.listen(port);

  logger.log(`🚀 Tkllm-darija API is running on http://localhost:${port}`);
  logger.log(`Environment: ${environment.toUpperCase()}`);
}

bootstrap().catch((error) => {
  console.error('❌ Failed to start the application:', error);
  process.exit(1);
});