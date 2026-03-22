import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import { PipelineDealsService } from './pipeline-deals.service';
import { SyncPipelineDealsDto } from './dto/sync-pipeline-deal.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { CurrentUserPayload } from '../auth/decorators/current-user.decorator';

@Controller('pipeline-deals')
@UseGuards(JwtAuthGuard)
export class PipelineDealsController {
  constructor(private readonly pipelineDealsService: PipelineDealsService) {}

  @Get()
  findAll(@CurrentUser() user: CurrentUserPayload) {
    if (!user.farmId) {
      throw new Error('User must have a farm assigned');
    }
    return this.pipelineDealsService.findAll(user.farmId);
  }

  @Put('sync')
  sync(@Body() body: SyncPipelineDealsDto, @CurrentUser() user: CurrentUserPayload) {
    if (!user.farmId) {
      throw new Error('User must have a farm assigned');
    }
    return this.pipelineDealsService.sync(user.farmId, body.deals);
  }
}
