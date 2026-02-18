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
import { LotsService } from './lots.service';
import { CreateLotDto } from './dto/lots.dto';
import { UpdateLotDto } from './dto/update-lots.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { CurrentUserPayload } from '../auth/decorators/current-user.decorator';

@Controller('plots')
export class LotsController {
  constructor(private readonly lotsService: LotsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() dto: CreateLotDto, @CurrentUser() user: CurrentUserPayload) {
    return this.lotsService.create(dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(@Query('fieldId') fieldId?: string, @CurrentUser() user?: CurrentUserPayload) {
    if (fieldId) {
      return this.lotsService.findByField(fieldId);
    }
    return this.lotsService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user?: CurrentUserPayload) {
    return this.lotsService.findOne(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateLotDto,
    @CurrentUser() user?: CurrentUserPayload,
  ) {
    return this.lotsService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user?: CurrentUserPayload) {
    return this.lotsService.remove(id);
  }
}
