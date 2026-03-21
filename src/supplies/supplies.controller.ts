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
import { SuppliesService } from './supplies.service';
import { CreateSupplyDto } from './dto/create-supply.dto';
import { UpdateSupplyDto } from './dto/update-supply.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { CurrentUserPayload } from '../auth/decorators/current-user.decorator';

@Controller('supplies')
@UseGuards(JwtAuthGuard)
export class SuppliesController {
  constructor(private readonly suppliesService: SuppliesService) {}

  @Post()
  create(@Body() dto: CreateSupplyDto, @CurrentUser() user: CurrentUserPayload) {
    if (!user.farmId) {
      throw new Error('User must have a farm assigned');
    }
    return this.suppliesService.create(dto, user.farmId);
  }

  @Get()
  findAll(@CurrentUser() user: CurrentUserPayload) {
    if (!user.farmId) {
      throw new Error('User must have a farm assigned');
    }
    return this.suppliesService.findAll(user.farmId);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    if (!user.farmId) {
      throw new Error('User must have a farm assigned');
    }
    return this.suppliesService.findOne(id, user.farmId);
  }

  @Put(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateSupplyDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    if (!user.farmId) {
      throw new Error('User must have a farm assigned');
    }
    return this.suppliesService.update(id, dto, user.farmId);
  }

  @Delete(':id')
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    if (!user.farmId) {
      throw new Error('User must have a farm assigned');
    }
    return this.suppliesService.remove(id, user.farmId);
  }
}
