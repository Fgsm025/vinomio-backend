import {
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
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { CurrentUserPayload } from '../auth/decorators/current-user.decorator';
import { CreateScoutingRecordDto } from './dto/create-scouting-record.dto';
import { UpdateScoutingRecordDto } from './dto/update-scouting-record.dto';
import { ScoutingRecordsService } from './scouting-records.service';

@Controller('scouting-records')
@UseGuards(JwtAuthGuard)
export class ScoutingRecordsController {
  constructor(private readonly scoutingRecordsService: ScoutingRecordsService) {}

  @Post()
  create(@Body() dto: CreateScoutingRecordDto, @CurrentUser() user: CurrentUserPayload) {
    if (!user.farmId) {
      throw new Error('User must have a farm assigned');
    }
    return this.scoutingRecordsService.create(dto, user.farmId);
  }

  @Get()
  findAll(@CurrentUser() user: CurrentUserPayload) {
    if (!user.farmId) {
      throw new Error('User must have a farm assigned');
    }
    return this.scoutingRecordsService.findAll(user.farmId);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: CurrentUserPayload) {
    if (!user.farmId) {
      throw new Error('User must have a farm assigned');
    }
    return this.scoutingRecordsService.findOne(id, user.farmId);
  }

  @Put(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateScoutingRecordDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    if (!user.farmId) {
      throw new Error('User must have a farm assigned');
    }
    return this.scoutingRecordsService.update(id, dto, user.farmId);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: CurrentUserPayload) {
    if (!user.farmId) {
      throw new Error('User must have a farm assigned');
    }
    return this.scoutingRecordsService.remove(id, user.farmId);
  }
}
