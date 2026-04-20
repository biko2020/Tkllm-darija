import { Module } from '@nestjs/common';
import { QualityService } from './quality.service';
import { QualityController } from './quality.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [QualityController],
  providers: [QualityService],
})
export class QualityModule {}