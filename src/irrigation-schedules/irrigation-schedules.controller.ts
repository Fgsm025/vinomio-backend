import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { CurrentUserPayload } from '../auth/decorators/current-user.decorator';
import { IrrigationSchedulesService } from './irrigation-schedules.service';
import { CreateIrrigationScheduleDto } from './dto/create-irrigation-schedule.dto';
import { UpdateIrrigationScheduleDto } from './dto/update-irrigation-schedule.dto';

@Controller('irrigation-schedules')
@UseGuards(JwtAuthGuard)
export class IrrigationSchedulesController {
  constructor(private readonly irrigationSchedulesService: IrrigationSchedulesService) {}

  @Post()
  create(@Body() dto: CreateIrrigationScheduleDto, @CurrentUser() user: CurrentUserPayload) {
    if (!user.farmId) throw new BadRequestException('User must have a farm assigned');
    return this.irrigationSchedulesService.create(dto, user.farmId);
  }

  @Get()
  findAll(@CurrentUser() user: CurrentUserPayload) {
    if (!user.farmId) throw new BadRequestException('User must have a farm assigned');
    return this.irrigationSchedulesService.findAll(user.farmId);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: CurrentUserPayload) {
    if (!user.farmId) throw new BadRequestException('User must have a farm assigned');
    return this.irrigationSchedulesService.findOne(id, user.farmId);
  }

  @Put(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateIrrigationScheduleDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    if (!user.farmId) throw new BadRequestException('User must have a farm assigned');
    return this.irrigationSchedulesService.update(id, dto, user.farmId);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: CurrentUserPayload) {
    if (!user.farmId) throw new BadRequestException('User must have a farm assigned');
    return this.irrigationSchedulesService.remove(id, user.farmId);
  }

  @Delete()
  removeByRange(
    @CurrentUser() user: CurrentUserPayload,
    @Query('start') start?: string,
    @Query('end') end?: string,
    @Query('fieldId') fieldId?: string,
    @Query('plotId') plotId?: string,
  ) {
    if (!user.farmId) throw new BadRequestException('User must have a farm assigned');
    return this.irrigationSchedulesService.removeByRange(
      {
        start,
        end,
        fieldId,
        plotId,
      },
      user.farmId,
    );
  }
}
