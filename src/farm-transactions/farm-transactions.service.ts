import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFarmTransactionDto } from './dto/create-farm-transaction.dto';
import { UpdateFarmTransactionDto } from './dto/update-farm-transaction.dto';

const MANUAL = 'manual';
const PURCHASE = 'purchase';

@Injectable()
export class FarmTransactionsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(farmId: string) {
    return this.prisma.farmTransaction.findMany({
      where: { farmId },
      include: { field: { select: { id: true, name: true } } },
      orderBy: [{ occurredAt: 'desc' }, { createdAt: 'desc' }],
    });
  }

  async create(dto: CreateFarmTransactionDto, farmId: string) {
    return this.prisma.farmTransaction.create({
      data: {
        farmId,
        direction: dto.direction,
        amount: dto.amount,
        occurredAt: new Date(dto.occurredAt),
        category: dto.category,
        description: dto.description,
        fieldId: dto.fieldId,
        sourceKind: MANUAL,
        sourceId: null,
      },
      include: { field: { select: { id: true, name: true } } },
    });
  }

  async update(id: string, dto: UpdateFarmTransactionDto, farmId: string) {
    const existing = await this.prisma.farmTransaction.findFirst({
      where: { id, farmId },
    });
    if (!existing) {
      throw new NotFoundException(`Transaction with id "${id}" not found`);
    }
    if (existing.sourceKind !== MANUAL) {
      throw new BadRequestException('Only manual entries can be edited');
    }

    return this.prisma.farmTransaction.update({
      where: { id },
      data: {
        direction: dto.direction,
        amount: dto.amount,
        occurredAt: dto.occurredAt ? new Date(dto.occurredAt) : undefined,
        category: dto.category,
        description: dto.description,
        fieldId: dto.fieldId,
      },
      include: { field: { select: { id: true, name: true } } },
    });
  }

  async remove(id: string, farmId: string) {
    const existing = await this.prisma.farmTransaction.findFirst({
      where: { id, farmId },
    });
    if (!existing) {
      throw new NotFoundException(`Transaction with id "${id}" not found`);
    }
    if (existing.sourceKind !== MANUAL) {
      throw new BadRequestException(
        'Linked transactions (e.g. purchases) must be removed from their source screen',
      );
    }
    return this.prisma.farmTransaction.delete({ where: { id } });
  }

  /** Keeps ledger in sync when a purchase is created or updated. */
  async syncFromPurchase(purchase: {
    id: string;
    farmId: string;
    total: { toString(): string } | number;
    date: Date;
    supplier?: { name: string } | null;
  }) {
    const total =
      typeof purchase.total === 'number'
        ? purchase.total
        : Number.parseFloat(purchase.total.toString());
    const desc = purchase.supplier?.name
      ? `Purchase — ${purchase.supplier.name}`
      : 'Purchase';

    await this.prisma.farmTransaction.upsert({
      where: {
        sourceKind_sourceId: {
          sourceKind: PURCHASE,
          sourceId: purchase.id,
        },
      },
      create: {
        farmId: purchase.farmId,
        direction: 'EXPENSE',
        amount: total,
        occurredAt: purchase.date,
        category: 'Purchase',
        description: desc,
        sourceKind: PURCHASE,
        sourceId: purchase.id,
      },
      update: {
        amount: total,
        occurredAt: purchase.date,
        description: desc,
      },
    });
  }

  async deletePurchaseLedger(purchaseId: string) {
    await this.prisma.farmTransaction.deleteMany({
      where: { sourceKind: PURCHASE, sourceId: purchaseId },
    });
  }
}
