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
import { CropsService } from './crops.service';
import { CreateCropDto } from './dto/create-crop.dto';
import { UpdateCropDto } from './dto/update-crop.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('crops')
@UseGuards(JwtAuthGuard)
export class CropsController {
  constructor(private readonly cropsService: CropsService) {}

  @Post()
  create(@Body() dto: CreateCropDto) {
    return this.cropsService.create(dto);
  }

  @Get()
  findAll() {
    return this.cropsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.cropsService.findOne(id);
  }

  @Put(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCropDto,
  ) {
    return this.cropsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.cropsService.remove(id);
  }
}
