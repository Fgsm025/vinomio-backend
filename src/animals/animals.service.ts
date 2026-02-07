import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAnimalDto } from './dto/create-animal.dto';
import { UpdateAnimalDto } from './dto/update-animal.dto';

@Injectable()
export class AnimalsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateAnimalDto) {
    return this.prisma.animal.create({ data: dto });
  }

  async findAll() {
    return this.prisma.animal.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const animal = await this.prisma.animal.findUnique({ where: { id } });
    if (!animal) {
      throw new NotFoundException(`Animal with id "${id}" not found`);
    }
    return animal;
  }

  async update(id: string, dto: UpdateAnimalDto) {
    await this.findOne(id);
    return this.prisma.animal.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.animal.delete({ where: { id } });
  }
}
