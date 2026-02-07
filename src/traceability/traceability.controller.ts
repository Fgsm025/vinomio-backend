import { Controller, Get, Post, Put, Delete, Body, Param, ParseUUIDPipe } from '@nestjs/common';
import { TraceabilityService } from './traceability.service';
import { CreateTraceabilityRecordDto } from './dto/create-traceability-record.dto';
import { UpdateTraceabilityRecordDto } from './dto/update-traceability-record.dto';

@Controller('traceability')
export class TraceabilityController {
  constructor(private readonly traceabilityService: TraceabilityService) {}

  @Post()
  create(@Body() dto: CreateTraceabilityRecordDto) {
    return this.traceabilityService.create(dto);
  }

  @Get()
  findAll() {
    return this.traceabilityService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.traceabilityService.findOne(id);
  }

  @Put(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateTraceabilityRecordDto) {
    return this.traceabilityService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.traceabilityService.remove(id);
  }
}
