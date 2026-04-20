import { Controller, Post, Body, UseGuards, Param } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { QualityService } from './quality.service';
import { ReviewSubmissionDto } from './dto/review-submission.dto';

@ApiTags('quality')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('quality')
export class QualityController {
  constructor(private readonly qualityService: QualityService) {}

  @Post('review/:submissionId')
  @Roles(UserRole.REVIEWER, UserRole.ADMIN)
  async reviewSubmission(
    @Param('submissionId') submissionId: string,
    @Body() dto: ReviewSubmissionDto,
    @CurrentUser() reviewer: any,
  ) {
    return this.qualityService.reviewSubmission(submissionId, reviewer.id, dto);
  }
}