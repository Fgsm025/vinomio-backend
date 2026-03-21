import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ProductionStockKind } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { CurrentUserPayload } from '../auth/decorators/current-user.decorator';
import { ProductionStockService } from './production-stock.service';
import { MergeHarvestDto } from './dto/merge-harvest.dto';
import { CreateByproductDto } from './dto/create-byproduct.dto';
import { UpdateProductionStockDto } from './dto/update-production-stock.dto';

@Controller('production-stock')
@UseGuards(JwtAuthGuard)
export class ProductionStockController {
  constructor(private readonly productionStockService: ProductionStockService) {}

  @Post('harvest-merge')
  mergeHarvest(
    @Body() dto: MergeHarvestDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    if (!user.farmId) {
      throw new Error('User must have a farm assigned');
    }
    return this.productionStockService.mergeHarvest(dto, user.farmId);
  }

  @Post('byproduct')
  createByproduct(
    @Body() dto: CreateByproductDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    if (!user.farmId) {
      throw new Error('User must have a farm assigned');
    }
    return this.productionStockService.createByproduct(dto, user.farmId);
  }

  @Get()
  findAll(
    @Query('kind') kind: string | undefined,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    if (!user.farmId) {
      throw new Error('User must have a farm assigned');
    }
    const k =
      kind === 'HARVEST' || kind === 'BYPRODUCT'
        ? (kind as ProductionStockKind)
        : undefined;
    return this.productionStockService.findAll(user.farmId, k);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    if (!user.farmId) {
      throw new Error('User must have a farm assigned');
    }
    return this.productionStockService.findOne(id, user.farmId);
  }

  @Put(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProductionStockDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    if (!user.farmId) {
      throw new Error('User must have a farm assigned');
    }
    return this.productionStockService.update(id, dto, user.farmId);
  }

  @Delete(':id')
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    if (!user.farmId) {
      throw new Error('User must have a farm assigned');
    }
    return this.productionStockService.remove(id, user.farmId);
  }
}
