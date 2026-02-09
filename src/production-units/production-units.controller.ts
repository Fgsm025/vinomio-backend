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
import { ProductionUnitsService } from './production-units.service';
import { CreateProductionUnitDto } from './dto/create-production-unit.dto';
import { UpdateProductionUnitDto } from './dto/update-production-unit.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { CurrentUserPayload } from '../auth/decorators/current-user.decorator';

@Controller('production-units')
export class ProductionUnitsController {
  constructor(
    private readonly productionUnitsService: ProductionUnitsService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(
    @Body() dto: CreateProductionUnitDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    if (!user.exploitationId && !user.needsOnboarding) {
      throw new Error('User must have an exploitation assigned or need onboarding');
    }
    return this.productionUnitsService.create({
      ...dto,
      exploitationId: dto.exploitationId || user.exploitationId,
    });
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(
    @Query('exploitationId') exploitationId: string | undefined,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    if (user.needsOnboarding) {
      return [];
    }
    const targetExploitationId = exploitationId || user.exploitationId;
    if (targetExploitationId) {
      return this.productionUnitsService.findByExploitation(targetExploitationId);
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
}
