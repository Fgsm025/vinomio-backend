import { Controller, Get, Post, Put, Delete, Body, Param, Query, ParseUUIDPipe } from '@nestjs/common';
import { CropCyclesService } from './crop-cycles.service';
import { CreateCropCycleDto } from './dto/create-crop-cycle.dto';
import { UpdateCropCycleDto } from './dto/update-crop-cycle.dto';

@Controller('crop-cycles')
export class CropCyclesController {
  constructor(private readonly cropCyclesService: CropCyclesService) {}

  @Post()
  create(@Body() dto: CreateCropCycleDto) {
    return this.cropCyclesService.create(dto);
  }

  @Get()
  findAll(@Query('sectorId') sectorId?: string) {
    if (sectorId) {
      return this.cropCyclesService.findBySector(sectorId);
    }
    return this.cropCyclesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.cropCyclesService.findOne(id);
  }

  @Put(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateCropCycleDto) {
    return this.cropCyclesService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.cropCyclesService.remove(id);
  }
}
