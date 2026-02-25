import { Controller, Get, Query, ParseIntPipe } from '@nestjs/common';
import { ActivitiesService } from './activities.service';

@Controller('activities')
export class ActivitiesController {
  constructor(private readonly activitiesService: ActivitiesService) {}

  @Get()
  findAll(
    @Query('farmId') farmId: string,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
    @Query('offset', new ParseIntPipe({ optional: true })) offset?: number,
  ) {
    if (!farmId) {
      throw new Error('farmId is required');
    }
    return this.activitiesService.findAll(farmId, limit || 20, offset || 0);
  }
}
