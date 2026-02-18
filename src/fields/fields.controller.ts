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
import { FieldsService } from './fields.service';
import { CreateFieldDto } from './dto/create-fields.dto';
import { UpdateFieldDto } from './dto/update-fields.dto';
import { CreateLotDto } from '../lots/dto/lots.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { CurrentUserPayload } from '../auth/decorators/current-user.decorator';

@Controller('fields')
export class FieldsController {
  constructor(private readonly fieldsService: FieldsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(
    @Body()
    dto: CreateFieldDto & {
      geometry?: Record<string, unknown>;
      surface?: number;
    },
    @CurrentUser() user: CurrentUserPayload,
  ) {
    if (!user.farmId && !user.needsOnboarding) {
      throw new Error('User must have a farm assigned or need onboarding');
    }
    return this.fieldsService.create(
      {
        ...dto,
        farmId: dto.farmId || user.farmId,
      },
      user.userId,
    );
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
      return this.fieldsService.findByFarm(targetFarmId);
    }
    return this.fieldsService.findAll(user.userId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.fieldsService.findOne(id, user.userId);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateFieldDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.fieldsService.update(id, dto, user.userId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.fieldsService.remove(id, user.userId);
  }

  @Patch(':id/subdivide')
  @UseGuards(JwtAuthGuard)
  subdivide(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { plots: CreateLotDto[] },
    @Query('replaceAll') replaceAll: string | undefined,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.fieldsService.subdivideField(
      id,
      body.plots,
      user.userId,
      replaceAll === 'true',
    );
  }
}
