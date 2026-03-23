import { BadRequestException, Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, Put, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { CurrentUserPayload } from '../auth/decorators/current-user.decorator';
import { RainfallEventsService } from './rainfall-events.service';
import { CreateRainfallEventDto } from './dto/create-rainfall-event.dto';
import { UpdateRainfallEventDto } from './dto/update-rainfall-event.dto';

@Controller('rainfall-events')
@UseGuards(JwtAuthGuard)
export class RainfallEventsController {
  constructor(private readonly rainfallEventsService: RainfallEventsService) {}

  @Post()
  create(@Body() dto: CreateRainfallEventDto, @CurrentUser() user: CurrentUserPayload) {
    if (!user.farmId) throw new BadRequestException('User must have a farm assigned');
    return this.rainfallEventsService.create(dto, user.farmId);
  }

  @Get()
  findAll(@CurrentUser() user: CurrentUserPayload) {
    if (!user.farmId) throw new BadRequestException('User must have a farm assigned');
    return this.rainfallEventsService.findAll(user.farmId);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: CurrentUserPayload) {
    if (!user.farmId) throw new BadRequestException('User must have a farm assigned');
    return this.rainfallEventsService.findOne(id, user.farmId);
  }

  @Put(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateRainfallEventDto, @CurrentUser() user: CurrentUserPayload) {
    if (!user.farmId) throw new BadRequestException('User must have a farm assigned');
    return this.rainfallEventsService.update(id, dto, user.farmId);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: CurrentUserPayload) {
    if (!user.farmId) throw new BadRequestException('User must have a farm assigned');
    return this.rainfallEventsService.remove(id, user.farmId);
  }
}
