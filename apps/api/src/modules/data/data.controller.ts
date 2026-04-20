import { Controller, Get, Post, UseGuards, Param, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { DataService } from './data.service';

@ApiTags('data')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('data')
export class DataController {
  constructor(private readonly dataService: DataService) {}

  @Get('datasets')
  async listDatasets(@Query('published') published?: boolean) {
    return this.dataService.listDatasets(published);
  }

  @Post('export')
  @Roles(UserRole.B2B_CLIENT, UserRole.ADMIN)
  async requestExport(@CurrentUser() user: any, @Body() dto: any) {
    return this.dataService.requestDatasetExport(user.id, dto);
  }
}