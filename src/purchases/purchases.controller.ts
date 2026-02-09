import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { PurchasesService } from './purchases.service';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
import { UpdatePurchaseDto } from './dto/update-purchase.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles, Role } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { CurrentUserPayload } from '../auth/decorators/current-user.decorator';

@Controller('purchases')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.OWNER, Role.FINANCE)
export class PurchasesController {
  constructor(private readonly purchasesService: PurchasesService) {}

  @Post()
  create(
    @Body() createPurchaseDto: CreatePurchaseDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    if (!user.exploitationId) {
      throw new Error('User must have an exploitation assigned');
    }
    return this.purchasesService.create(createPurchaseDto, user.exploitationId);
  }

  @Get()
  findAll(@CurrentUser() user: CurrentUserPayload) {
    if (!user.exploitationId) {
      throw new Error('User must have an exploitation assigned');
    }
    return this.purchasesService.findAll(user.exploitationId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    if (!user.exploitationId) {
      throw new Error('User must have an exploitation assigned');
    }
    return this.purchasesService.findOne(id, user.exploitationId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updatePurchaseDto: UpdatePurchaseDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    if (!user.exploitationId) {
      throw new Error('User must have an exploitation assigned');
    }
    return this.purchasesService.update(id, updatePurchaseDto, user.exploitationId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    if (!user.exploitationId) {
      throw new Error('User must have an exploitation assigned');
    }
    return this.purchasesService.remove(id, user.exploitationId);
  }
}
