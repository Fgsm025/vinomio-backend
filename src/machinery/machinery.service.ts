import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMachineryDto } from './dto/create-machinery.dto';
import { UpdateMachineryDto } from './dto/update-machinery.dto';

@Injectable()
export class MachineryService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateMachineryDto) {
    const { model, ...rest } = dto;
    const created = await this.prisma.machinery.create({
      data: {
        ...rest,
        modelName: model,
      },
    });
    const { modelName, ...restCreated } = created;
    return {
      ...restCreated,
      model: modelName,
    };
  }

  async findAll() {
    const machinery = await this.prisma.machinery.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return machinery.map(({ modelName, ...rest }) => ({
      ...rest,
      model: modelName,
    }));
  }

  async findOne(id: string) {
    const machinery = await this.prisma.machinery.findUnique({ where: { id } });
    if (!machinery) {
      throw new NotFoundException(`Machinery with id "${id}" not found`);
    }
    const { modelName, ...rest } = machinery;
    return {
      ...rest,
      model: modelName,
    };
  }

  async update(id: string, dto: UpdateMachineryDto) {
    await this.findOne(id);
    const { model, ...rest } = dto;
    const updated = await this.prisma.machinery.update({
      where: { id },
      data: {
        ...rest,
        ...(model !== undefined && { modelName: model }),
      },
    });
    const { modelName, ...restUpdated } = updated;
    return {
      ...restUpdated,
      model: modelName,
    };
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.machinery.delete({ where: { id } });
  }
}
