import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSupplyDto } from './dto/create-supply.dto';
import { CreateSupplyStockMovementDto } from './dto/create-supply-stock-movement.dto';
import { UpdateSupplyDto } from './dto/update-supply.dto';

@Injectable()
export class SuppliesService {
  private readonly logger = new Logger(SuppliesService.name);

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
      type: dto.supplyType?.trim() || 'OTHER',
      carbonFactor: dto.carbonFactor ?? 0,
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

  private async assertCropCycleInFarm(
    cropCycleId: string | undefined,
    farmId: string,
  ) {
    if (!cropCycleId || cropCycleId.trim() === '') return;
    const cycle = await this.prisma.cropCycle.findFirst({
      where: { id: cropCycleId.trim(), plot: { field: { farmId } } },
    });
    if (!cycle) {
      throw new BadRequestException('Crop cycle not found for this farm');
    }
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

  private async assertFarmExists(farmId: string) {
    const farm = await this.prisma.farm.findUnique({
      where: { id: farmId },
      select: { id: true },
    });
    if (!farm) {
      throw new BadRequestException(
        `La finca no existe en esta base de datos (farmId=${farmId}). Elegí otra finca en la app, limpiá localStorage (selected_farm_id) o alineá el seed / DATABASE_URL.`,
      );
    }
  }

  async create(dto: CreateSupplyDto, farmId: string) {
    await this.assertFarmExists(farmId);
    await this.assertSupplierInFarm(dto.supplierId, farmId);
    const data = this.toCreateData(dto, farmId);
    try {
      return await this.prisma.supply.create({ data });
    } catch (err: unknown) {
      if (err instanceof Prisma.PrismaClientKnownRequestError) {
        this.logger.error(
          `Prisma supply.create failed code=${err.code} message=${err.message} meta=${JSON.stringify(err.meta)}`,
        );
        if (err.code === 'P2022' || /column|does not exist/i.test(String(err.message))) {
          this.logger.error(
            '→ Falta columna en DB: ejecuta migraciones en vinomio-backend: npx prisma migrate deploy (o migrate dev)',
          );
        }
        if (
          err.code === 'P2025' &&
          err.meta &&
          typeof err.meta === 'object' &&
          'model' in err.meta &&
          err.meta.model === 'Farm'
        ) {
          throw new BadRequestException(
            'La finca indicada no existe en la base de datos (revisá finca seleccionada y DATABASE_URL).',
          );
        }
      } else {
        this.logger.error(`supply.create unexpected error: ${String(err)}`);
      }
      throw err;
    }
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
    if (dto.supplyType !== undefined) {
      data.type = dto.supplyType?.trim() || 'OTHER';
    }
    if (dto.carbonFactor !== undefined) data.carbonFactor = dto.carbonFactor;
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

  async createStockMovement(
    supplyId: string,
    dto: CreateSupplyStockMovementDto,
    farmId: string,
  ) {
    const supply = await this.findOne(supplyId, farmId);
    const qty = dto.quantity;
    const movementDate =
      this.parseOptionalDate(dto.date) ?? new Date();
    const dateOnly = new Date(
      Date.UTC(
        movementDate.getUTCFullYear(),
        movementDate.getUTCMonth(),
        movementDate.getUTCDate(),
      ),
    );

    const cropId =
      dto.cropCycleId != null && String(dto.cropCycleId).trim() !== ''
        ? String(dto.cropCycleId).trim()
        : undefined;

    if (supply.type === 'FUEL' && dto.type === 'OUTGOING') {
      if (!cropId) {
        throw new BadRequestException(
          'cropCycleId is required when recording fuel consumption (outgoing)',
        );
      }
    }

    if (cropId) {
      await this.assertCropCycleInFarm(cropId, farmId);
    }

    if (dto.type === 'OUTGOING') {
      if (supply.stockQuantity < qty) {
        throw new BadRequestException('Insufficient stock for this outgoing movement');
      }
    }

    const delta = dto.type === 'INCOMING' ? qty : -qty;
    const nextStock = supply.stockQuantity + delta;
    if (nextStock < 0) {
      throw new BadRequestException('Insufficient stock for this outgoing movement');
    }

    return this.prisma.$transaction(async (tx) => {
      const movement = await tx.supplyStockMovement.create({
        data: {
          productId: supplyId,
          quantity: qty,
          type: dto.type,
          date: dateOnly,
          farmId,
          cropCycleId: cropId ?? null,
        },
      });
      await tx.supply.update({
        where: { id: supplyId },
        data: { stockQuantity: nextStock },
      });
      return movement;
    });
  }

  /**
   * Anula una salida de combustible: restaura stock y elimina el movimiento (ajusta huella del ciclo).
   */
  async deleteStockMovement(movementId: string, farmId: string) {
    const movement = await this.prisma.supplyStockMovement.findFirst({
      where: { id: movementId, farmId },
      include: { supply: true },
    });
    if (!movement) {
      throw new NotFoundException(`Stock movement with id "${movementId}" not found`);
    }
    if (movement.type !== 'OUTGOING') {
      throw new BadRequestException('Only OUTGOING movements can be reversed');
    }
    if (movement.supply.type !== 'FUEL') {
      throw new BadRequestException('Only fuel (FUEL) movements can be reversed from this endpoint');
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.supply.update({
        where: { id: movement.productId },
        data: { stockQuantity: { increment: movement.quantity } },
      });
      await tx.supplyStockMovement.delete({ where: { id: movementId } });
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
