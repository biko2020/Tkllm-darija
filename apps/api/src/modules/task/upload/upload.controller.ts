import { Controller, Post, UseGuards, Body } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { TaskService } from '../task.service';
import { GenerateUploadUrlDto } from './dto/generate-upload-url.dto';

@ApiTags('tasks')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('tasks/upload')
export class UploadController {
  constructor(private readonly taskService: TaskService) {}

  @Post('presigned')
  @ApiOperation({ summary: 'Generate pre-signed S3 URL for audio upload' })
  async generatePresignedUrl(
    @CurrentUser() user: any,
    @Body() dto: GenerateUploadUrlDto,
  ) {
    return this.taskService.generatePresignedUploadUrl(user.id, dto);
  }
}