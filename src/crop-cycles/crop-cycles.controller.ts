import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { CropCyclesService } from './crop-cycles.service';
import { CreateCropCycleDto } from './dto/create-crop-cycle.dto';
import { CreateMultipleCropCyclesDto } from './dto/create-multiple-crop-cycles.dto';
import { UpdateCropCycleDto } from './dto/update-crop-cycle.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { CurrentUserPayload } from '../auth/decorators/current-user.decorator';

@Controller('crop-cycles')
@UseGuards(JwtAuthGuard)
export class CropCyclesController {
  constructor(private readonly cropCyclesService: CropCyclesService) {}

  @Post()
  create(@Body() dto: CreateCropCycleDto | CreateMultipleCropCyclesDto) {
    if (
      'plotIds' in dto &&
      Array.isArray(dto.plotIds) &&
      dto.plotIds.length > 0
    ) {
      return this.cropCyclesService.createMultiple(
        dto as CreateMultipleCropCyclesDto,
      );
    }
    return this.cropCyclesService.create(dto as CreateCropCycleDto);
  }

  @Get()
  findAll(@Query('plotId') plotId?: string, @Query('season') season?: string) {
    if (plotId && !season) {
      return this.cropCyclesService.findByPlot(plotId);
    }
    return this.cropCyclesService.findAll({ plotId, season });
  }

  @Get(':id/water-footprint')
  getWaterFootprint(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.cropCyclesService.getWaterFootprint(id, user.farmId);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.cropCyclesService.findOne(id);
  }

  @Put(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCropCycleDto,
  ) {
    return this.cropCyclesService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.cropCyclesService.remove(id);
  }
}
