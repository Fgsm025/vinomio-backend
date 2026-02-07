import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseUUIDPipe,
} from '@nestjs/common';
import { WaterSourcesService } from './water-sources.service';
import { CreateWaterSourceDto } from './dto/create-water-source.dto';
import { UpdateWaterSourceDto } from './dto/update-water-source.dto';

@Controller('water-sources')
export class WaterSourcesController {
  constructor(private readonly waterSourcesService: WaterSourcesService) {}

  @Post()
  create(@Body() dto: CreateWaterSourceDto) {
    return this.waterSourcesService.create(dto);
  }

  @Get()
  findAll() {
    return this.waterSourcesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.waterSourcesService.findOne(id);
  }

  @Put(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateWaterSourceDto,
  ) {
    return this.waterSourcesService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.waterSourcesService.remove(id);
  }
}
