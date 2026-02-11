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
  Patch,
} from '@nestjs/common';
import { ProductionUnitsService } from './production-units.service';
import { CreateProductionUnitDto } from './dto/create-production-unit.dto';
import { UpdateProductionUnitDto } from './dto/update-production-unit.dto';
import { CreateSectorDto } from '../sectors/dto/create-sector.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { CurrentUserPayload } from '../auth/decorators/current-user.decorator';

@Controller('fields')
export class ProductionUnitsController {
  constructor(
    private readonly productionUnitsService: ProductionUnitsService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(
    @Body() dto: CreateProductionUnitDto & { geometry?: Record<string, unknown>; surface?: number },
    @CurrentUser() user: CurrentUserPayload,
  ) {
    if (!user.farmId && !user.needsOnboarding) {
      throw new Error('User must have a farm assigned or need onboarding');
    }
    return this.productionUnitsService.create({
      ...dto,
      farmId: dto.farmId || user.farmId,
    }, user.userId);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(
    @Query('farmId') farmId: string | undefined,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    if (user.needsOnboarding) {
      return [];
    }
    const targetFarmId = farmId || user.farmId;
    if (targetFarmId) {
      return this.productionUnitsService.findByFarm(targetFarmId);
    }
    return this.productionUnitsService.findAll(user.userId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.productionUnitsService.findOne(id, user.userId);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProductionUnitDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.productionUnitsService.update(id, dto, user.userId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.productionUnitsService.remove(id, user.userId);
  }

  @Patch(':id/subdivide')
  @UseGuards(JwtAuthGuard)
  subdivide(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { plots: CreateSectorDto[] },
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.productionUnitsService.subdivideField(id, body.plots, user.userId);
  }
}
