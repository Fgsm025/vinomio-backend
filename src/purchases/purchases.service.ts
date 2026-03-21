import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ActivitiesService } from '../activities/activities.service';
import { FarmTransactionsService } from '../farm-transactions/farm-transactions.service';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
import { UpdatePurchaseDto } from './dto/update-purchase.dto';

@Injectable()
export class PurchasesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly activitiesService: ActivitiesService,
    private readonly farmTransactionsService: FarmTransactionsService,
  ) {}

  async create(createPurchaseDto: CreatePurchaseDto, farmId: string) {
    const purchase = await this.prisma.purchase.create({
      data: {
        ...createPurchaseDto,
        farmId,
        total: createPurchaseDto.total,
        date: new Date(createPurchaseDto.date),
      },
      include: {
        supplier: true,
      },
    });
    
    this.activitiesService.log({
      type: 'PURCHASE_MADE',
      title: 'Purchase recorded',
      description: `Purchase from ${purchase.supplier?.name || 'supplier'} - $${purchase.total}`,
      icon: 'material-symbols:attach-money-rounded',
      entityId: purchase.id,
      entityType: 'purchase',
      farmId,
      metadata: {
        total: purchase.total.toString(),
        supplierId: purchase.supplierId,
      },
    });

    await this.farmTransactionsService.syncFromPurchase(purchase);

    return purchase;
  }

  async findAll(farmId: string) {
    return this.prisma.purchase.findMany({
      where: { farmId },
      include: {
        supplier: true,
        supplyStockMovement: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, farmId: string) {
    const purchase = await this.prisma.purchase.findFirst({
      where: {
        id,
        farmId,
      },
      include: {
        supplier: true,
        supplyStockMovement: true,
      },
    });

    if (!purchase) {
      throw new NotFoundException(`Purchase with id "${id}" not found`);
    }

    return purchase;
  }

  async update(id: string, updatePurchaseDto: UpdatePurchaseDto, farmId: string) {
    await this.findOne(id, farmId);

    const updated = await this.prisma.purchase.update({
      where: { id },
      data: {
        ...updatePurchaseDto,
        date: updatePurchaseDto.date ? new Date(updatePurchaseDto.date) : undefined,
      },
      include: {
        supplier: true,
      },
    });

    await this.farmTransactionsService.syncFromPurchase(updated);

    return updated;
  }

  async remove(id: string, farmId: string) {
    await this.findOne(id, farmId);
    await this.farmTransactionsService.deletePurchaseLedger(id);
    return this.prisma.purchase.delete({ where: { id } });
  }
}
