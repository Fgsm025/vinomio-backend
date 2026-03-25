import { BadRequestException, Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, Put, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { CurrentUserPayload } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GrazingLocationsService } from './grazing-locations.service';
import { CreateGrazingLocationDto } from './dto/create-grazing-location.dto';
import { UpdateGrazingLocationDto } from './dto/update-grazing-location.dto';

@Controller('grazing-locations')
@UseGuards(JwtAuthGuard)
export class GrazingLocationsController {
  constructor(private readonly grazingLocationsService: GrazingLocationsService) {}

  private assertFarm(user: CurrentUserPayload) {
    if (!user.farmId) throw new BadRequestException('User must have a farm assigned');
  }

  @Post()
  create(@Body() dto: CreateGrazingLocationDto, @CurrentUser() user: CurrentUserPayload) {
    this.assertFarm(user);
    return this.grazingLocationsService.create(dto);
  }

  @Get()
  findAll(@CurrentUser() user: CurrentUserPayload) {
    this.assertFarm(user);
    return this.grazingLocationsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: CurrentUserPayload) {
    this.assertFarm(user);
    return this.grazingLocationsService.findOne(id);
  }

  @Put(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateGrazingLocationDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    this.assertFarm(user);
    return this.grazingLocationsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: CurrentUserPayload) {
    this.assertFarm(user);
    return this.grazingLocationsService.remove(id);
  }
}
