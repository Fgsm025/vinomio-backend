import { BadRequestException, Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, Put, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { CurrentUserPayload } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TraceabilityService } from './traceability.service';
import { CreateTraceabilityRecordDto } from './dto/create-traceability-record.dto';
import { UpdateTraceabilityRecordDto } from './dto/update-traceability-record.dto';

@Controller('traceability')
@UseGuards(JwtAuthGuard)
export class TraceabilityController {
  constructor(private readonly traceabilityService: TraceabilityService) {}

  private assertFarm(user: CurrentUserPayload) {
    if (!user.farmId) throw new BadRequestException('User must have a farm assigned');
  }

  @Post()
  create(@Body() dto: CreateTraceabilityRecordDto, @CurrentUser() user: CurrentUserPayload) {
    this.assertFarm(user);
    return this.traceabilityService.create(dto);
  }

  @Get()
  findAll(@CurrentUser() user: CurrentUserPayload) {
    this.assertFarm(user);
    return this.traceabilityService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: CurrentUserPayload) {
    this.assertFarm(user);
    return this.traceabilityService.findOne(id);
  }

  @Put(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTraceabilityRecordDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    this.assertFarm(user);
    return this.traceabilityService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: CurrentUserPayload) {
    this.assertFarm(user);
    return this.traceabilityService.remove(id);
  }
}
