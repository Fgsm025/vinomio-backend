import { Controller, Get, Post, Put, Delete, Body, Param, ParseUUIDPipe } from '@nestjs/common';
import { IrrigationSchedulesService } from './irrigation-schedules.service';
import { CreateIrrigationScheduleDto } from './dto/create-irrigation-schedule.dto';
import { UpdateIrrigationScheduleDto } from './dto/update-irrigation-schedule.dto';

@Controller('irrigation-schedules')
export class IrrigationSchedulesController {
  constructor(private readonly irrigationSchedulesService: IrrigationSchedulesService) {}

  @Post()
  create(@Body() dto: CreateIrrigationScheduleDto) {
    return this.irrigationSchedulesService.create(dto);
  }

  @Get()
  findAll() {
    return this.irrigationSchedulesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.irrigationSchedulesService.findOne(id);
  }

  @Put(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateIrrigationScheduleDto) {
    return this.irrigationSchedulesService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.irrigationSchedulesService.remove(id);
  }
}
