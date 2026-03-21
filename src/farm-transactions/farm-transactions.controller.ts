import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { FarmTransactionsService } from './farm-transactions.service';
import { CreateFarmTransactionDto } from './dto/create-farm-transaction.dto';
import { UpdateFarmTransactionDto } from './dto/update-farm-transaction.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles, Role } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { CurrentUserPayload } from '../auth/decorators/current-user.decorator';

@Controller('farm-transactions')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.OWNER, Role.ADMIN, Role.FINANCE, Role.AGRONOMIST)
export class FarmTransactionsController {
  constructor(private readonly farmTransactionsService: FarmTransactionsService) {}

  @Get()
  findAll(@CurrentUser() user: CurrentUserPayload) {
    if (!user.farmId) {
      throw new Error('User must have a farm assigned');
    }
    return this.farmTransactionsService.findAll(user.farmId);
  }

  @Post()
  create(
    @Body() dto: CreateFarmTransactionDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    if (!user.farmId) {
      throw new Error('User must have a farm assigned');
    }
    return this.farmTransactionsService.create(dto, user.farmId);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateFarmTransactionDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    if (!user.farmId) {
      throw new Error('User must have a farm assigned');
    }
    return this.farmTransactionsService.update(id, dto, user.farmId);
  }

  @Delete(':id')
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    if (!user.farmId) {
      throw new Error('User must have a farm assigned');
    }
    return this.farmTransactionsService.remove(id, user.farmId);
  }
}
