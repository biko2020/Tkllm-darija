/**
 * app.module.ts — Root Module
 *
 * Central module that wires together all feature modules,
 * global configurations, and third-party integrations.
 */

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { TaskModule } from './modules/task/task.module';
import { DataModule } from './modules/data/data.module';
import { QualityModule } from './modules/quality/quality.module';
import { PaymentModule } from './modules/payment/payment.module';

import { configuration } from './config/configuration';
import { validationSchema } from './config/validation.schema';

@Module({
  imports: [
    // ======================
    // Global Configuration
    // ======================
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validationSchema: validationSchema,
      validationOptions: {
        abortEarly: true,
      },
      envFilePath: ['.env', '.env.local', '.env.development'],
    }),

    // ======================
    // Database
    // ======================
    PrismaModule,

    // ======================
    // Feature Modules
    // ======================
    AuthModule,
    UserModule,
    TaskModule,
    DataModule,
    QualityModule,
    PaymentModule,

    // Future modules can be added here:
    // CampaignModule,
    // AnalyticsModule,
    // NotificationModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}