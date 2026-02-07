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
} from '@nestjs/common';
import { ProductionUnitsService } from './production-units.service';
import { CreateProductionUnitDto } from './dto/create-production-unit.dto';
import { UpdateProductionUnitDto } from './dto/update-production-unit.dto';

@Controller('production-units')
export class ProductionUnitsController {
  constructor(
    private readonly productionUnitsService: ProductionUnitsService,
  ) {}

  @Post()
  create(@Body() dto: CreateProductionUnitDto) {
    return this.productionUnitsService.create(dto);
  }

  @Get()
  findAll(@Query('exploitationId') exploitationId?: string) {
    if (exploitationId) {
      return this.productionUnitsService.findByExploitation(exploitationId);
    }
    return this.productionUnitsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.productionUnitsService.findOne(id);
  }

  @Put(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProductionUnitDto,
  ) {
    return this.productionUnitsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.productionUnitsService.remove(id);
  }
}
