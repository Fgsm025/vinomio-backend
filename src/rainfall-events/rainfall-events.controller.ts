import { Controller, Get, Post, Put, Delete, Body, Param, ParseUUIDPipe } from '@nestjs/common';
import { RainfallEventsService } from './rainfall-events.service';
import { CreateRainfallEventDto } from './dto/create-rainfall-event.dto';
import { UpdateRainfallEventDto } from './dto/update-rainfall-event.dto';

@Controller('rainfall-events')
export class RainfallEventsController {
  constructor(private readonly rainfallEventsService: RainfallEventsService) {}

  @Post()
  create(@Body() dto: CreateRainfallEventDto) {
    return this.rainfallEventsService.create(dto);
  }

  @Get()
  findAll() {
    return this.rainfallEventsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.rainfallEventsService.findOne(id);
  }

  @Put(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateRainfallEventDto) {
    return this.rainfallEventsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.rainfallEventsService.remove(id);
  }
}
