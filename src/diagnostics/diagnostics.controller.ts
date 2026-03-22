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
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { CurrentUserPayload } from '../auth/decorators/current-user.decorator';
import { CreateDiagnosticDto } from './dto/create-diagnostic.dto';
import { UpdateDiagnosticDto } from './dto/update-diagnostic.dto';
import { DiagnosticsService } from './diagnostics.service';

@Controller('diagnostics')
@UseGuards(JwtAuthGuard)
export class DiagnosticsController {
  constructor(private readonly diagnosticsService: DiagnosticsService) {}

  @Post()
  create(@Body() dto: CreateDiagnosticDto, @CurrentUser() user: CurrentUserPayload) {
    if (!user.farmId) {
      throw new Error('User must have a farm assigned');
    }
    return this.diagnosticsService.create(dto, user.farmId);
  }

  @Get()
  findAll(@CurrentUser() user: CurrentUserPayload) {
    if (!user.farmId) {
      throw new Error('User must have a farm assigned');
    }
    return this.diagnosticsService.findAll(user.farmId);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: CurrentUserPayload) {
    if (!user.farmId) {
      throw new Error('User must have a farm assigned');
    }
    return this.diagnosticsService.findOne(id, user.farmId);
  }

  @Put(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateDiagnosticDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    if (!user.farmId) {
      throw new Error('User must have a farm assigned');
    }
    return this.diagnosticsService.update(id, dto, user.farmId);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: CurrentUserPayload) {
    if (!user.farmId) {
      throw new Error('User must have a farm assigned');
    }
    return this.diagnosticsService.remove(id, user.farmId);
  }
}
