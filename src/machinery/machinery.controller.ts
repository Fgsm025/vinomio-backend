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
import { MachineryService } from './machinery.service';
import { CreateMachineryDto } from './dto/create-machinery.dto';
import { UpdateMachineryDto } from './dto/update-machinery.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { CurrentUserPayload } from '../auth/decorators/current-user.decorator';

@Controller('machinery')
@UseGuards(JwtAuthGuard)
export class MachineryController {
  constructor(private readonly machineryService: MachineryService) {}

  @Post()
  create(
    @Body() dto: CreateMachineryDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    if (!user.exploitationId) {
      throw new Error('User must have an exploitation assigned');
    }
    return this.machineryService.create(dto, user.exploitationId);
  }

  @Get()
  findAll(@CurrentUser() user: CurrentUserPayload) {
    if (!user.exploitationId) {
      throw new Error('User must have an exploitation assigned');
    }
    return this.machineryService.findAll(user.exploitationId);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    if (!user.exploitationId) {
      throw new Error('User must have an exploitation assigned');
    }
    return this.machineryService.findOne(id, user.exploitationId);
  }

  @Put(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateMachineryDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    if (!user.exploitationId) {
      throw new Error('User must have an exploitation assigned');
    }
    return this.machineryService.update(id, dto, user.exploitationId);
  }

  @Delete(':id')
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    if (!user.exploitationId) {
      throw new Error('User must have an exploitation assigned');
    }
    return this.machineryService.remove(id, user.exploitationId);
  }
}
