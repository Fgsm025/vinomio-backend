import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCropDto } from './dto/create-crop.dto';
import { UpdateCropDto } from './dto/update-crop.dto';

@Injectable()
export class CropsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateCropDto) {
    return this.prisma.crop.create({ data: dto });
  }

  async findAll() {
    return this.prisma.crop.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const crop = await this.prisma.crop.findUnique({ where: { id } });
    if (!crop) {
      throw new NotFoundException(`Crop with id "${id}" not found`);
    }
    return crop;
  }

  async update(id: string, dto: UpdateCropDto) {
    await this.findOne(id);
    return this.prisma.crop.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.crop.delete({ where: { id } });
  }
}
