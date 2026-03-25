import { BadRequestException, Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, Put, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { CurrentUserPayload } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { LivestockGroupsService } from './livestock-groups.service';
import { CreateLivestockGroupDto } from './dto/create-livestock-group.dto';
import { UpdateLivestockGroupDto } from './dto/update-livestock-group.dto';

@Controller('livestock-groups')
@UseGuards(JwtAuthGuard)
export class LivestockGroupsController {
  constructor(private readonly livestockGroupsService: LivestockGroupsService) {}

  private assertFarm(user: CurrentUserPayload) {
    if (!user.farmId) throw new BadRequestException('User must have a farm assigned');
  }

  @Post()
  create(@Body() dto: CreateLivestockGroupDto, @CurrentUser() user: CurrentUserPayload) {
    this.assertFarm(user);
    return this.livestockGroupsService.create(dto);
  }

  @Get()
  findAll(@CurrentUser() user: CurrentUserPayload) {
    this.assertFarm(user);
    return this.livestockGroupsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: CurrentUserPayload) {
    this.assertFarm(user);
    return this.livestockGroupsService.findOne(id);
  }

  @Put(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateLivestockGroupDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    this.assertFarm(user);
    return this.livestockGroupsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: CurrentUserPayload) {
    this.assertFarm(user);
    return this.livestockGroupsService.remove(id);
  }
}
