import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super({
      log: process.env.NODE_ENV === 'development' 
        ? ['query', 'info', 'warn', 'error'] 
        : ['error'],
    });
  }

  async onModuleInit() {
    await this.$connect();
    console.log('✅ Prisma connected to database');
  }

  async onModuleDestroy() {
    await this.$disconnect();
    console.log('🛑 Prisma disconnected');
  }

  // Optional: Helper for TimescaleDB hypertables
  async createHypertable(tableName: string, timeColumn: string = 'hour') {
    await this.$executeRawUnsafe(
      `SELECT create_hypertable('${tableName}', '${timeColumn}', if_not_exists => true);`
    );
  }
}