import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';

@Injectable()
export class ClientsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateClientDto, farmId: string) {
    return this.prisma.client.create({
      data: {
        ...dto,
        farmId,
      },
    });
  }

  async findAll(farmId: string) {
    return this.prisma.client.findMany({
      where: { farmId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, farmId: string) {
    const row = await this.prisma.client.findFirst({
      where: { id, farmId },
    });

    if (!row) {
      throw new NotFoundException(`Client with id "${id}" not found`);
    }

    return row;
  }

  async update(id: string, dto: UpdateClientDto, farmId: string) {
    await this.findOne(id, farmId);
    return this.prisma.client.update({
      where: { id },
      data: dto as never,
    });
  }

  async remove(id: string, farmId: string) {
    await this.findOne(id, farmId);
    return this.prisma.client.delete({
      where: { id },
    });
  }
}
