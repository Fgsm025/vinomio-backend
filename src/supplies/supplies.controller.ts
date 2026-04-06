import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { SuppliesService } from './supplies.service';
import { CreateSupplyDto } from './dto/create-supply.dto';
import { CreateSupplyStockMovementDto } from './dto/create-supply-stock-movement.dto';
import { UpdateSupplyDto } from './dto/update-supply.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { CurrentUserPayload } from '../auth/decorators/current-user.decorator';

const FARM_CONTEXT =
  'Sin finca en contexto: el JWT no trae farmId y x-farm-id no aplicó (ausente o sin fila en user_farms). En Docker con DB vacía: prisma db seed; si el front guardó un farmId viejo, borrá selected_farm_id en localStorage y volvé a entrar.';

@Controller('supplies')
@UseGuards(JwtAuthGuard)
export class SuppliesController {
  private readonly logger = new Logger(SuppliesController.name);

  constructor(private readonly suppliesService: SuppliesService) {}

  private farmIdOrThrow(user: CurrentUserPayload): string {
    if (!user.farmId) {
      throw new BadRequestException(FARM_CONTEXT);
    }
    return user.farmId;
  }

  @Post()
  create(@Body() dto: CreateSupplyDto, @CurrentUser() user: CurrentUserPayload) {
    const farmId = this.farmIdOrThrow(user);
    this.logger.log(
      `POST create supply farmId=${farmId} supplyType=${dto.supplyType ?? '(undefined)'} carbonFactor=${dto.carbonFactor ?? '(undefined)'} category=${dto.category ?? '(undefined)'} name="${(dto.name ?? '').slice(0, 60)}"`,
    );
    return this.suppliesService.create(dto, farmId);
  }

  @Get()
  findAll(@CurrentUser() user: CurrentUserPayload) {
    return this.suppliesService.findAll(this.farmIdOrThrow(user));
  }

  @Post(':id/stock-movements')
  createStockMovement(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateSupplyStockMovementDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.suppliesService.createStockMovement(
      id,
      dto,
      this.farmIdOrThrow(user),
    );
  }

  @Delete('stock-movements/:movementId')
  deleteStockMovement(
    @Param('movementId', ParseUUIDPipe) movementId: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.suppliesService.deleteStockMovement(
      movementId,
      this.farmIdOrThrow(user),
    );
  }

  @Get(':id')
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.suppliesService.findOne(id, this.farmIdOrThrow(user));
  }

  @Put(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateSupplyDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.suppliesService.update(id, dto, this.farmIdOrThrow(user));
  }

  @Delete(':id')
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.suppliesService.remove(id, this.farmIdOrThrow(user));
  }
}
