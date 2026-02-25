import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateActivityDto } from './dto/create-activity.dto';

@Injectable()
export class ActivitiesService {
  constructor(private readonly prisma: PrismaService) {}

  async log(dto: CreateActivityDto) {
    try {
      const data: Prisma.ActivityUncheckedCreateInput = {
        type: dto.type,
        title: dto.title,
        description: dto.description ?? null,
        icon: dto.icon,
        entityId: dto.entityId ?? null,
        entityType: dto.entityType ?? null,
        farmId: dto.farmId,
        userId: dto.userId ?? null,
        metadata: dto.metadata as Prisma.InputJsonValue | undefined,
      };

      const created = await this.prisma.activity.create({ data });

      const extraActivities = await this.prisma.activity.findMany({
        where: { farmId: dto.farmId },
        orderBy: { createdAt: 'desc' },
        skip: 10,
        select: { id: true },
      });

      if (extraActivities.length > 0) {
        await this.prisma.activity.deleteMany({
          where: { id: { in: extraActivities.map((a) => a.id) } },
        });
      }

      return created;
    } catch (error) {
      console.error('Failed to log activity:', error);
      return null;
    }
  }

  async findAll(farmId: string, limit = 20, offset = 0) {
    return this.prisma.activity.findMany({
      where: { farmId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });
  }
}
