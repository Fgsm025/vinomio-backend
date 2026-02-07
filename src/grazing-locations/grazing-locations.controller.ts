import { Controller, Get, Post, Put, Delete, Body, Param, ParseUUIDPipe } from '@nestjs/common';
import { GrazingLocationsService } from './grazing-locations.service';
import { CreateGrazingLocationDto } from './dto/create-grazing-location.dto';
import { UpdateGrazingLocationDto } from './dto/update-grazing-location.dto';

@Controller('grazing-locations')
export class GrazingLocationsController {
  constructor(private readonly grazingLocationsService: GrazingLocationsService) {}

  @Post()
  create(@Body() dto: CreateGrazingLocationDto) {
    return this.grazingLocationsService.create(dto);
  }

  @Get()
  findAll() {
    return this.grazingLocationsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.grazingLocationsService.findOne(id);
  }

  @Put(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateGrazingLocationDto) {
    return this.grazingLocationsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.grazingLocationsService.remove(id);
  }
}
