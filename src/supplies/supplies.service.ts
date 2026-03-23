import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSupplyDto } from './dto/create-supply.dto';
import { UpdateSupplyDto } from './dto/update-supply.dto';

@Injectable()
export class SuppliesService {
  constructor(private readonly prisma: PrismaService) {}

  private parseOptionalDate(value?: string | null): Date | undefined {
    if (value == null || value === '') return undefined;
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? undefined : d;
  }

  private toCreateData(
    dto: CreateSupplyDto,
    farmId: string,
  ): Prisma.SupplyCreateInput {
    const supplierConnect =
      dto.supplierId && dto.supplierId.trim() !== ''
        ? { connect: { id: dto.supplierId.trim() } }
        : undefined;

    return {
      name: dto.name.trim(),
      category: dto.category?.trim() || null,
      status: dto.status?.trim() || 'active',
      unit: dto.unit?.trim() || 'unit',
      description: dto.description?.trim() || null,
      minimumStock: dto.minimumStock ?? 0,
      useSupplierProduct: dto.useSupplierProduct ?? false,
      supplierProductId: dto.supplierProductId?.trim() || null,
      stockOrigin: dto.stockOrigin?.trim() || null,
      purchaseDate: this.parseOptionalDate(dto.purchaseDate) ?? null,
      purchaseCost: dto.purchaseCost ?? null,
      salePrice: dto.salePrice ?? null,
      priceRegular: dto.priceRegular ?? 0,
      priceDiscounted: dto.priceDiscounted ?? 0,
      vendor: dto.vendor?.trim() || null,
      sku: dto.sku?.trim() || null,
      barcode: dto.barcode?.trim() || null,
      publishedAt: this.parseOptionalDate(dto.publishedAt) ?? null,
      warehouseId: dto.warehouseId?.trim() || null,
      expiryDate: this.parseOptionalDate(dto.expiryDate) ?? null,
      stockQuantity: dto.stockQuantity ?? 0,
      farm: { connect: { id: farmId } },
      ...(supplierConnect ? { supplier: supplierConnect } : {}),
    };
  }

  private async assertSupplierInFarm(
    supplierId: string | undefined,
    farmId: string,
  ) {
    if (!supplierId || supplierId.trim() === '') return;
    const s = await this.prisma.supplier.findFirst({
      where: { id: supplierId.trim(), farmId },
    });
    if (!s) {
      throw new NotFoundException(`Supplier with id "${supplierId}" not found`);
    }
  }

  async create(dto: CreateSupplyDto, farmId: string) {
    await this.assertSupplierInFarm(dto.supplierId, farmId);
    return this.prisma.supply.create({
      data: this.toCreateData(dto, farmId),
    });
  }

  async findAll(farmId: string) {
    return this.prisma.supply.findMany({
      where: { farmId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, farmId: string) {
    const row = await this.prisma.supply.findFirst({
      where: { id, farmId },
    });
    if (!row) {
      throw new NotFoundException(`Supply with id "${id}" not found`);
    }
    return row;
  }

  async update(id: string, dto: UpdateSupplyDto, farmId: string) {
    await this.findOne(id, farmId);
    if (dto.supplierId !== undefined) {
      await this.assertSupplierInFarm(dto.supplierId, farmId);
    }

    const data: Prisma.SupplyUpdateInput = {};

    if (dto.name !== undefined) data.name = dto.name.trim();
    if (dto.category !== undefined) data.category = dto.category?.trim() || null;
    if (dto.status !== undefined) data.status = dto.status?.trim() || 'active';
    if (dto.unit !== undefined) data.unit = dto.unit?.trim() || 'unit';
    if (dto.description !== undefined) data.description = dto.description?.trim() || null;
    if (dto.minimumStock !== undefined) data.minimumStock = dto.minimumStock;
    if (dto.useSupplierProduct !== undefined) data.useSupplierProduct = dto.useSupplierProduct;
    if (dto.supplierProductId !== undefined) {
      data.supplierProductId = dto.supplierProductId?.trim() || null;
    }
    if (dto.stockOrigin !== undefined) data.stockOrigin = dto.stockOrigin?.trim() || null;
    if (dto.purchaseDate !== undefined) {
      data.purchaseDate = this.parseOptionalDate(dto.purchaseDate) ?? null;
    }
    if (dto.purchaseCost !== undefined) data.purchaseCost = dto.purchaseCost;
    if (dto.salePrice !== undefined) data.salePrice = dto.salePrice;
    if (dto.priceRegular !== undefined) data.priceRegular = dto.priceRegular;
    if (dto.priceDiscounted !== undefined) data.priceDiscounted = dto.priceDiscounted;
    if (dto.vendor !== undefined) data.vendor = dto.vendor?.trim() || null;
    if (dto.sku !== undefined) data.sku = dto.sku?.trim() || null;
    if (dto.barcode !== undefined) data.barcode = dto.barcode?.trim() || null;
    if (dto.publishedAt !== undefined) {
      data.publishedAt = this.parseOptionalDate(dto.publishedAt) ?? null;
    }
    if (dto.warehouseId !== undefined) data.warehouseId = dto.warehouseId?.trim() || null;
    if (dto.expiryDate !== undefined) {
      data.expiryDate = this.parseOptionalDate(dto.expiryDate) ?? null;
    }
    if (dto.stockQuantity !== undefined) data.stockQuantity = dto.stockQuantity;

    if (dto.supplierId !== undefined) {
      if (!dto.supplierId || dto.supplierId.trim() === '') {
        data.supplier = { disconnect: true };
      } else {
        data.supplier = { connect: { id: dto.supplierId.trim() } };
      }
    }

    return this.prisma.supply.update({
      where: { id },
      data,
    });
  }

  async remove(id: string, farmId: string) {
    await this.findOne(id, farmId);
    const sprays = await this.prisma.sprayRecord.count({
      where: { products: { some: { productId: id } } },
    });
    if (sprays > 0) {
      throw new ConflictException(
        'Cannot delete supply: it is referenced by spray records',
      );
    }
    return this.prisma.supply.delete({ where: { id } });
  }
}
