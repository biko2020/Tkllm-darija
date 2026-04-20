import { Controller, Get, Post, UseGuards, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { TaskService } from './task.service';
import { SubmitTaskDto } from './dto/submit-task.dto';

@ApiTags('tasks')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('tasks')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Get('next')
  @ApiOperation({ summary: 'Get next available task for the authenticated contributor' })
  async getNextTask(@CurrentUser() user: any, @Query('domain') domain?: string) {
    return this.taskService.getNextTask(user.id, domain);
  }

  @Post(':taskId/submit')
  @ApiOperation({ summary: 'Submit audio recording for a task' })
  async submitTask(
    @CurrentUser() user: any,
    @Param('taskId') taskId: string,
    @Body() dto: SubmitTaskDto,
  ) {
    return this.taskService.submitTask(user.id, taskId, dto);
  }
}