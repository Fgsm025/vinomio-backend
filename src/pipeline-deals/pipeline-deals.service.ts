import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { SyncPipelineDealDto } from './dto/sync-pipeline-deal.dto';

@Injectable()
export class PipelineDealsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(farmId: string) {
    return this.prisma.pipelineDeal.findMany({
      where: { farmId },
      orderBy: [{ stage: 'asc' }, { sortOrder: 'asc' }, { createDate: 'asc' }],
    });
  }

  async sync(farmId: string, deals: SyncPipelineDealDto[]) {
    if (deals.length === 0) {
      await this.prisma.pipelineDeal.deleteMany({ where: { farmId } });
      return { ok: true, count: 0 };
    }

    const incomingIds = deals.map((d) => d.id);

    await this.prisma.$transaction(async (tx) => {
      await tx.pipelineDeal.deleteMany({
        where: {
          farmId,
          id: { notIn: incomingIds },
        },
      });

      for (const d of deals) {
        const base = {
          stage: d.stage,
          sortOrder: d.sortOrder,
          name: d.name,
          description: d.description ?? null,
          amount: d.amount,
          quantity: d.quantity ?? null,
          productId: d.productId ?? null,
          priority: d.priority,
          progress: d.progress,
          clientId: d.clientId ?? null,
          createDate: new Date(d.createDate),
          closeDate: new Date(d.closeDate),
          lastUpdate: new Date(d.lastUpdate),
          owner: d.owner as Prisma.InputJsonValue,
          client: d.client as Prisma.InputJsonValue,
          company: d.company as Prisma.InputJsonValue,
          collaborators: (d.collaborators ?? []) as Prisma.InputJsonValue,
        };

        await tx.pipelineDeal.upsert({
          where: { id: d.id },
          create: {
            id: d.id,
            farmId,
            ...base,
          },
          update: base,
        });
      }
    });

    return { ok: true, count: deals.length };
  }
}
