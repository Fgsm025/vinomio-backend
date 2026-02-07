import { Controller, Get, Post, Put, Delete, Body, Param, ParseUUIDPipe } from '@nestjs/common';
import { LivestockGroupsService } from './livestock-groups.service';
import { CreateLivestockGroupDto } from './dto/create-livestock-group.dto';
import { UpdateLivestockGroupDto } from './dto/update-livestock-group.dto';

@Controller('livestock-groups')
export class LivestockGroupsController {
  constructor(private readonly livestockGroupsService: LivestockGroupsService) {}

  @Post()
  create(@Body() dto: CreateLivestockGroupDto) {
    return this.livestockGroupsService.create(dto);
  }

  @Get()
  findAll() {
    return this.livestockGroupsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.livestockGroupsService.findOne(id);
  }

  @Put(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateLivestockGroupDto) {
    return this.livestockGroupsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.livestockGroupsService.remove(id);
  }
}
