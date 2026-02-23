import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { WaterConsumptionService } from './water-consumption.service';
import { CreateWaterConsumptionDto } from './dto/create-water-consumption.dto';
import { UpdateWaterConsumptionDto } from './dto/update-water-consumption.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('farms/:farmSlug/water-consumptions')
export class WaterConsumptionController {
  constructor(private readonly waterConsumptionService: WaterConsumptionService) {}

  @Get()
  findByFarmSlug(@Param('farmSlug') farmSlug: string) {
    return this.waterConsumptionService.findByFarmSlug(farmSlug);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  create(
    @Param('farmSlug') farmSlug: string,
    @Body() dto: CreateWaterConsumptionDto,
  ) {
    return this.waterConsumptionService.create(farmSlug, dto);
  }

  @Get(':id')
  findOne(
    @Param('farmSlug') farmSlug: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.waterConsumptionService.findOne(farmSlug, id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('farmSlug') farmSlug: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateWaterConsumptionDto,
  ) {
    return this.waterConsumptionService.update(farmSlug, id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(
    @Param('farmSlug') farmSlug: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.waterConsumptionService.remove(farmSlug, id);
  }
}
