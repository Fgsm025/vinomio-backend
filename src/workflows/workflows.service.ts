import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWorkflowDto } from './dto/create-workflow.dto';
import { UpdateWorkflowDto } from './dto/update-workflow.dto';
import { getPrismaFarmId } from '../prisma/prisma-farm-context';

@Injectable()
export class WorkflowsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateWorkflowDto) {
    const farmId = getPrismaFarmId();
    if (!farmId) throw new UnauthorizedException('Missing farm context');

    return this.prisma.workflow.create({
      data: {
        name: dto.name,
        description: dto.description,
        nodes: dto.nodes as object,
        edges: dto.edges as object,
        isTemplate: dto.isTemplate ?? false,
        // farmId is injected from the authenticated farm context (JWT)
        farmId,
      },
    });
  }

  async findAll(_farmId?: string, isTemplate?: boolean) {
    let where: Prisma.WorkflowWhereInput | undefined;
    if (isTemplate !== undefined) {
      where = { isTemplate };
    }
    return this.prisma.workflow.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const workflow = await this.prisma.workflow.findUnique({
      where: { id },
    });
    if (!workflow) {
      throw new NotFoundException(`Workflow with id "${id}" not found`);
    }
    return workflow;
  }

  async update(id: string, dto: UpdateWorkflowDto) {
    await this.findOne(id);
    return this.prisma.workflow.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.nodes !== undefined && { nodes: dto.nodes as object }),
        ...(dto.edges !== undefined && { edges: dto.edges as object }),
        ...(dto.isTemplate !== undefined && { isTemplate: dto.isTemplate }),
        // farmId is tenant-owned; don't allow changing it from the client payload.
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.workflow.delete({ where: { id } });
  }
}
