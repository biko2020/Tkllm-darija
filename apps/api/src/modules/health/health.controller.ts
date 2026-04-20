import { Controller, Get } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckService,
  HttpHealthIndicator,
  TypeOrmHealthIndicator,
} from '@nestjs/terminus';
import { PrismaService } from '../../prisma/prisma.service';

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private http: HttpHealthIndicator,
    private prisma: PrismaService,
  ) {}

  @Get()
  @HealthCheck()
  async check() {
    return this.health.check([
      // Basic HTTP check (can be your own endpoint or external)
      () => this.http.pingCheck('nestjs', 'https://docs.nestjs.com'),

      // Database health check (Prisma + PostgreSQL)
      async () => {
        try {
          await this.prisma.$queryRaw`SELECT 1`;
          return {
            db: { status: 'up' },
          };
        } catch (error) {
          return {
            db: { status: 'down', error: error.message },
          };
        }
      },

      // Redis check (if you're using it)
      // async () => this.redisHealth.check('redis'),
    ]);
  }
}