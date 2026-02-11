import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCropDto } from './dto/create-crop.dto';
import { UpdateCropDto } from './dto/update-crop.dto';

function mapCropDtoToData(dto: CreateCropDto | UpdateCropDto) {
  const exploitationSystem =
    (dto as CreateCropDto).exploitationSystem === 'drying'
      ? 'rainfed'
      : (dto as CreateCropDto).exploitationSystem;
  const betweenRows =
    (dto as CreateCropDto).betweenRows ?? (dto as CreateCropDto).horizontalPlantingFrame;
  const onRow =
    (dto as CreateCropDto).onRow ?? (dto as CreateCropDto).verticalPlantingFrame;
  const maturationDays =
    (dto as CreateCropDto).maturationDays ?? (dto as CreateCropDto).veraisonDays;
  const cropDestinations =
    (dto as CreateCropDto).cropDestinations ??
    ((dto as CreateCropDto).cropDestination
      ? [(dto as CreateCropDto).cropDestination!]
      : undefined);
  const { agriculturalActivity: _, ...rest } = dto as CreateCropDto & {
    agriculturalActivity?: string;
  };
  return {
    ...rest,
    ...(exploitationSystem !== undefined && { exploitationSystem }),
    ...(betweenRows !== undefined && { betweenRows }),
    ...(onRow !== undefined && { onRow }),
    ...(maturationDays !== undefined && { maturationDays }),
    ...(cropDestinations !== undefined && { cropDestinations }),
  };
}

@Injectable()
export class CropsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateCropDto) {
    const data = mapCropDtoToData(dto);
    return this.prisma.crop.create({ data: data as never });
  }

  async findAll() {
    const crops = await this.prisma.crop.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return crops.map((c) => ({
      ...c,
      maturationDays: c.maturationDays ?? c.veraisonDays ?? null,
      betweenRows: c.betweenRows ?? c.horizontalPlantingFrame ?? null,
      onRow: c.onRow ?? c.verticalPlantingFrame ?? null,
    }));
  }

  async findOne(id: string) {
    const crop = await this.prisma.crop.findUnique({ where: { id } });
    if (!crop) {
      throw new NotFoundException(`Crop with id "${id}" not found`);
    }
    return {
      ...crop,
      maturationDays: crop.maturationDays ?? crop.veraisonDays ?? null,
      betweenRows: crop.betweenRows ?? crop.horizontalPlantingFrame ?? null,
      onRow: crop.onRow ?? crop.verticalPlantingFrame ?? null,
    };
  }

  async update(id: string, dto: UpdateCropDto) {
    await this.prisma.crop.findUniqueOrThrow({ where: { id } });
    const data = mapCropDtoToData(dto);
    const crop = await this.prisma.crop.update({
      where: { id },
      data: data as never,
    });
    return {
      ...crop,
      maturationDays: crop.maturationDays ?? crop.veraisonDays ?? null,
      betweenRows: crop.betweenRows ?? crop.horizontalPlantingFrame ?? null,
      onRow: crop.onRow ?? crop.verticalPlantingFrame ?? null,
    };
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.crop.delete({ where: { id } });
  }
}
