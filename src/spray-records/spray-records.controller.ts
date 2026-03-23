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
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { CurrentUserPayload } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateSprayRecordDto } from './dto/create-spray-record.dto';
import { UpdateSprayRecordDto } from './dto/update-spray-record.dto';
import { SprayRecordsService } from './spray-records.service';

@Controller('spray-records')
@UseGuards(JwtAuthGuard)
export class SprayRecordsController {
  constructor(private readonly sprayRecordsService: SprayRecordsService) {}

  @Post()
  create(@Body() dto: CreateSprayRecordDto, @CurrentUser() user: CurrentUserPayload) {
    if (!user.farmId) throw new BadRequestException('User must have a farm assigned');
    return this.sprayRecordsService.create(dto, user.farmId);
  }

  @Get()
  findAll(@CurrentUser() user: CurrentUserPayload) {
    if (!user.farmId) throw new BadRequestException('User must have a farm assigned');
    return this.sprayRecordsService.findAll(user.farmId);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: CurrentUserPayload) {
    if (!user.farmId) throw new BadRequestException('User must have a farm assigned');
    return this.sprayRecordsService.findOne(id, user.farmId);
  }

  @Put(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateSprayRecordDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    if (!user.farmId) throw new BadRequestException('User must have a farm assigned');
    return this.sprayRecordsService.update(id, dto, user.farmId);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: CurrentUserPayload) {
    if (!user.farmId) throw new BadRequestException('User must have a farm assigned');
    return this.sprayRecordsService.remove(id, user.farmId);
  }
}
