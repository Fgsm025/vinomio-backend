import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ProductionStockKind } from '@prisma/client';
import { MergeHarvestDto } from './dto/merge-harvest.dto';
import { CreateByproductDto } from './dto/create-byproduct.dto';
import { UpdateProductionStockDto } from './dto/update-production-stock.dto';

@Injectable()
export class ProductionStockService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(farmId: string, kind?: ProductionStockKind) {
    return this.prisma.productionStock.findMany({
      where: {
        farmId,
        ...(kind ? { kind } : {}),
      },
      orderBy: { updatedAt: 'desc' },
      include: {
        crop: { select: { id: true, product: true, nameOrDescription: true } },
        cropCycle: { select: { id: true, name: true } },
      },
    });
  }

  async findOne(id: string, farmId: string) {
    const row = await this.prisma.productionStock.findFirst({
      where: { id, farmId },
      include: {
        crop: { select: { id: true, product: true, nameOrDescription: true } },
        cropCycle: { select: { id: true, name: true } },
      },
    });
    if (!row) {
      throw new NotFoundException(`Production stock "${id}" not found`);
    }
    return row;
  }

  async mergeHarvest(dto: MergeHarvestDto, farmId: string) {
    const cycle = await this.prisma.cropCycle.findFirst({
      where: { id: dto.cropCycleId },
      include: { crop: true },
    });
    if (!cycle || cycle.crop.farmId !== farmId) {
      throw new NotFoundException('Crop cycle not found for this farm');
    }
    if (cycle.cropId !== dto.cropId) {
      throw new BadRequestException('cropId does not match the crop cycle');
    }

    const harvestDate = new Date(dto.harvestDate);
    const expiryDate = dto.expiryDate ? new Date(dto.expiryDate) : null;

    const existing = await this.prisma.productionStock.findFirst({
      where: {
        farmId,
        kind: ProductionStockKind.HARVEST,
        cropCycleId: dto.cropCycleId,
      },
    });

    if (existing) {
      return this.prisma.productionStock.update({
        where: { id: existing.id },
        data: {
          quantity: existing.quantity + dto.quantity,
          status: 'available',
          unit: dto.unit,
          minStockLevel: dto.minStockLevel ?? existing.minStockLevel,
          harvestDate,
          expiryDate: expiryDate ?? existing.expiryDate,
        },
        include: {
          crop: { select: { id: true, product: true, nameOrDescription: true } },
          cropCycle: { select: { id: true, name: true } },
        },
      });
    }

    return this.prisma.productionStock.create({
      data: {
        farmId,
        kind: ProductionStockKind.HARVEST,
        cropId: dto.cropId,
        cropCycleId: dto.cropCycleId,
        quantity: dto.quantity,
        status: 'available',
        unit: dto.unit,
        minStockLevel: dto.minStockLevel,
        harvestDate,
        expiryDate: expiryDate ?? undefined,
      },
      include: {
        crop: { select: { id: true, product: true, nameOrDescription: true } },
        cropCycle: { select: { id: true, name: true } },
      },
    });
  }

  async createByproduct(dto: CreateByproductDto, farmId: string) {
    return this.prisma.productionStock.create({
      data: {
        farmId,
        kind: ProductionStockKind.BYPRODUCT,
        quantity: dto.quantity,
        status: 'available',
        unit: dto.unit,
        name: dto.name,
        category: dto.category,
        productionDate: new Date(dto.productionDate),
        fieldId: dto.fieldId,
        plotIds: dto.plotIds ? (dto.plotIds as unknown as object) : undefined,
        warehouseId: dto.warehouseId,
        salePrice: dto.salePrice,
        notes: dto.notes,
      },
      include: {
        crop: { select: { id: true, product: true, nameOrDescription: true } },
        cropCycle: { select: { id: true, name: true } },
      },
    });
  }

  async update(id: string, dto: UpdateProductionStockDto, farmId: string) {
    await this.findOne(id, farmId);

    const data: Parameters<typeof this.prisma.productionStock.update>[0]['data'] = {};
    if (dto.quantity !== undefined) data.quantity = dto.quantity;
    if (dto.status !== undefined) data.status = dto.status;
    if (dto.unit !== undefined) data.unit = dto.unit;
    if (dto.minStockLevel !== undefined) data.minStockLevel = dto.minStockLevel;
    if (dto.harvestDate !== undefined) data.harvestDate = new Date(dto.harvestDate);
    if (dto.expiryDate !== undefined) {
      data.expiryDate = dto.expiryDate ? new Date(dto.expiryDate) : null;
    }
    if (dto.productionDate !== undefined) {
      data.productionDate = new Date(dto.productionDate);
    }
    if (dto.name !== undefined) data.name = dto.name;
    if (dto.category !== undefined) data.category = dto.category;
    if (dto.fieldId !== undefined) data.fieldId = dto.fieldId;
    if (dto.notes !== undefined) data.notes = dto.notes;
    if (dto.salePrice !== undefined) data.salePrice = dto.salePrice;

    return this.prisma.productionStock.update({
      where: { id },
      data,
      include: {
        crop: { select: { id: true, product: true, nameOrDescription: true } },
        cropCycle: { select: { id: true, name: true } },
      },
    });
  }

  async remove(id: string, farmId: string) {
    await this.findOne(id, farmId);
    return this.prisma.productionStock.delete({ where: { id } });
  }
}
