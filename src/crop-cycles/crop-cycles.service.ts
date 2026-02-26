import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ActivitiesService } from '../activities/activities.service';
import { CreateCropCycleDto } from './dto/create-crop-cycle.dto';
import { CreateMultipleCropCyclesDto } from './dto/create-multiple-crop-cycles.dto';
import { UpdateCropCycleDto } from './dto/update-crop-cycle.dto';
import {
  getAllTasksFromWorkflowTemplate,
  getFirstTaskFromWorkflow,
} from '../services/workflow-to-tasks';

function totalPhenologyDays(crop: {
  plantingDays?: number | null;
  growingDays?: number | null;
  maturationDays?: number | null;
  veraisonDays?: number | null;
  harvestDays?: number | null;
}): number | null {
  const planting = crop.plantingDays ?? 0;
  const growing = crop.growingDays ?? 0;
  const maturation = crop.maturationDays ?? crop.veraisonDays ?? 0;
  const harvest = crop.harvestDays ?? 0;
  if (planting + growing + maturation + harvest === 0) return null;
  return planting + growing + maturation + harvest;
}

function addDays(date: Date, days: number): Date {
  const out = new Date(date);
  out.setDate(out.getDate() + days);
  return out;
}

function enrichCycle<
  T extends {
    plantingDate: Date;
    estimatedHarvestDate?: Date | null;
    status: string;
  },
>(
  cycle: T,
): T & {
  daysToHarvest: number | null;
  progressPercentage: number | null;
  isDelayed: boolean;
} {
  const now = new Date();
  const estimated =
    cycle.estimatedHarvestDate instanceof Date
      ? cycle.estimatedHarvestDate
      : cycle.estimatedHarvestDate
        ? new Date(cycle.estimatedHarvestDate as string)
        : null;
  const planting =
    cycle.plantingDate instanceof Date
      ? cycle.plantingDate
      : new Date(cycle.plantingDate as string);
  let daysToHarvest: number | null = null;
  let progressPercentage: number | null = null;
  let isDelayed = false;
  if (estimated) {
    daysToHarvest = Math.ceil((estimated.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    const total = Math.ceil((estimated.getTime() - planting.getTime()) / (1000 * 60 * 60 * 24));
    if (total > 0) {
      const elapsed = Math.ceil((now.getTime() - planting.getTime()) / (1000 * 60 * 60 * 24));
      progressPercentage = Math.min(100, Math.max(0, (elapsed / total) * 100));
      isDelayed = daysToHarvest < 0 && cycle.status === 'active';
    }
  }
  return {
    ...cycle,
    daysToHarvest,
    progressPercentage,
    isDelayed,
  };
}

@Injectable()
export class CropCyclesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly activitiesService: ActivitiesService,
  ) {}

  private async resolveWorkflowName(cycle: {
    templateId?: string | null;
    workflowOption?: string | null;
    stages?: unknown;
  }): Promise<string | null> {
    if (cycle.templateId) {
      const w = await this.prisma.workflow.findUnique({
        where: { id: cycle.templateId },
        select: { name: true },
      });
      return w?.name ?? null;
    }
    const stagesArr = Array.isArray(cycle.stages) ? cycle.stages : null;
    if (cycle.workflowOption === 'stages' && stagesArr) {
      const firstWithWorkflow = stagesArr.find(
        (s: { workflowId?: string | null }) =>
          s?.workflowId != null && String(s.workflowId).trim() !== '',
      ) as { workflowId?: string | null } | undefined;
      if (firstWithWorkflow?.workflowId) {
        const w = await this.prisma.workflow.findUnique({
          where: { id: firstWithWorkflow.workflowId },
          select: { name: true },
        });
        return w?.name ?? null;
      }
    }
    return null;
  }

  private async addWorkflowTemplateName<T extends Record<string, unknown>>(
    cycle: T
  ): Promise<T & { workflowTemplateName?: string | null }> {
    const existing =
      typeof cycle.workflowTemplateName === 'string' && cycle.workflowTemplateName !== ''
        ? cycle.workflowTemplateName
        : null;
    if (existing != null) {
      return { ...cycle, workflowTemplateName: existing };
    }
    const name = await this.resolveWorkflowName({
      templateId: cycle.templateId as string | null | undefined,
      workflowOption: cycle.workflowOption as string | null | undefined,
      stages: cycle.stages,
    });
    return { ...cycle, workflowTemplateName: name };
  }

  private async enrichStagesWithWorkflowNames<T extends { stages?: unknown }>(
    cycle: T
  ): Promise<T> {
    const stagesArr = Array.isArray(cycle.stages) ? cycle.stages : null;
    if (!stagesArr || stagesArr.length === 0) return cycle;
    const workflowIds = stagesArr
      .map((s: { workflowId?: string | null }) => s?.workflowId)
      .filter((id): id is string => id != null && String(id).trim() !== '');
    if (workflowIds.length === 0) return cycle;
    const workflows = await this.prisma.workflow.findMany({
      where: { id: { in: workflowIds } },
      select: { id: true, name: true },
    });
    const nameById = new Map(workflows.map((w) => [w.id, w.name]));
    const enrichedStages = stagesArr.map((s: Record<string, unknown>) => {
      const wid = s.workflowId as string | undefined;
      const workflowName = wid ? nameById.get(wid) ?? null : null;
      return { ...s, workflowName };
    });
    return { ...cycle, stages: enrichedStages };
  }

  async create(dto: CreateCropCycleDto) {
    const crop = await this.prisma.crop.findUnique({ where: { id: dto.cropId } });
    if (!crop) {
      throw new NotFoundException(`Crop with id "${dto.cropId}" not found`);
    }
    const plantingDate = new Date(dto.plantingDate);
    let plantDensity = dto.plantDensity;
    if (
      dto.plantedArea != null &&
      dto.plantCount != null &&
      dto.plantedArea > 0 &&
      (plantDensity == null || plantDensity === 0)
    ) {
      plantDensity = dto.plantCount / dto.plantedArea;
    }
    const totalDays = totalPhenologyDays(crop);
    let estimatedHarvestDate: Date | undefined;
    if (totalDays != null && totalDays > 0) {
      estimatedHarvestDate = addDays(plantingDate, totalDays);
    }
    const payload: any = {
      cropId: dto.cropId,
      plotId: dto.plotId,
      season: dto.season ?? '',
      status: dto.status ?? 'active',
      plantingDate,
      currentStatus: dto.currentStatus,
      ...(dto.name && { name: dto.name }),
      ...(dto.variety && { variety: dto.variety }),
      ...(dto.region && { region: dto.region }),
      ...(dto.endDate && { endDate: new Date(dto.endDate) }),
      ...(dto.endReason && { endReason: dto.endReason }),
      ...(dto.plantedArea != null && { plantedArea: dto.plantedArea }),
      ...(dto.plantCount != null && { plantCount: dto.plantCount }),
      ...(plantDensity != null && { plantDensity }),
      ...(dto.phenologyTemplateId && { phenologyTemplateId: dto.phenologyTemplateId }),
      ...(dto.manualAdjustments && { manualAdjustments: dto.manualAdjustments }),
      ...(dto.workflowOption && { workflowOption: dto.workflowOption }),
      ...(dto.templateId && { templateId: dto.templateId }),
      ...(dto.stages && { stages: dto.stages }),
      ...(dto.notes && { notes: dto.notes }),
      ...(dto.seedBatch && { seedBatch: dto.seedBatch }),
      ...(dto.nurseryOrigin && { nurseryOrigin: dto.nurseryOrigin }),
      ...(dto.supplier && { supplier: dto.supplier }),
      ...(estimatedHarvestDate && { estimatedHarvestDate }),
      ...(dto.estimatedHarvestDate && {
        estimatedHarvestDate: new Date(dto.estimatedHarvestDate),
      }),
      ...(dto.actualHarvestStartDate && {
        actualHarvestStartDate: new Date(dto.actualHarvestStartDate),
      }),
      ...(dto.actualHarvestEndDate && {
        actualHarvestEndDate: new Date(dto.actualHarvestEndDate),
      }),
      ...(dto.actualYield != null && { actualYield: dto.actualYield }),
      ...(dto.yieldUnit && { yieldUnit: dto.yieldUnit }),
      ...(dto.previousCropId && { previousCropId: dto.previousCropId }),
      ...(dto.nextPlannedCropId && { nextPlannedCropId: dto.nextPlannedCropId }),
    };
    let cycle = await this.prisma.cropCycle.create({
      data: payload as never,
      include: { crop: true, plot: { include: { field: true } } },
    });

    const workflowName = await this.resolveWorkflowName(cycle);
    if (workflowName != null) {
      await this.prisma.cropCycle.update({
        where: { id: cycle.id },
        data: { workflowTemplateName: workflowName },
      });
      cycle = { ...cycle, workflowTemplateName: workflowName };
    }

    const farmId = cycle.plot?.field?.farmId;
    const cropName = cycle.crop?.product || cycle.crop?.nameOrDescription || '';
    const plotName = cycle.plot?.name || '';
    const cycleDisplayName = cycle.name || `${cropName} - ${plotName}`.trim() || 'Ciclo';

    if (farmId && dto.workflowOption === 'template' && dto.templateId) {
      const workflow = await this.prisma.workflow.findUnique({
        where: { id: dto.templateId },
      });
      if (workflow) {
        const nodes = Array.isArray(workflow.nodes) ? (workflow.nodes as any[]) : [];
        const edges = Array.isArray(workflow.edges) ? (workflow.edges as any[]) : [];
        if (nodes.length > 0) {
          const tasksToCreate = getAllTasksFromWorkflowTemplate(
            nodes,
            edges,
            cycle.id,
            workflow.id,
            workflow.name,
            cycleDisplayName,
            plotName,
            0,
            farmId,
          );
          for (const taskPayload of tasksToCreate) {
            await this.prisma.task.create({ data: taskPayload });
          }
        }
      }
    }

    if (farmId && dto.workflowOption === 'stages' && dto.stages?.length > 0) {
      for (let i = 0; i < dto.stages.length; i++) {
        const stage = dto.stages[i];
        const workflowIds = [
          ...(stage.workflowId ? [stage.workflowId] : []),
          ...(stage.subWorkflowIds || []),
        ];

        for (const workflowId of workflowIds) {
          const workflow = await this.prisma.workflow.findUnique({
            where: { id: workflowId },
          });

          if (!workflow) {
            continue;
          }

          const nodes = Array.isArray(workflow.nodes) ? (workflow.nodes as any[]) : [];
          const edges = Array.isArray(workflow.edges) ? (workflow.edges as any[]) : [];

          if (nodes.length === 0) continue;

          const firstTask = getFirstTaskFromWorkflow(
            nodes,
            edges,
            cycle.id,
            workflow.id,
            workflow.name,
            cycleDisplayName,
            plotName,
            i,
            farmId,
          );

          if (firstTask) {
            await this.prisma.task.create({ data: firstTask });
          }
        }
      }
    }

    const enriched = enrichCycle(cycle);
    const withName = await this.addWorkflowTemplateName(enriched);
    
    if (farmId) {
      this.activitiesService.log({
        type: 'CROP_CYCLE_CREATED',
        title: 'Production cycle started',
        description: `${cropName} planted in ${plotName}`,
        icon: 'material-symbols:eco-outline-rounded',
        entityId: cycle.id,
        entityType: 'crop_cycle',
        farmId,
      });
    }
    
    return this.enrichStagesWithWorkflowNames(withName);
  }

  async createMultiple(dto: CreateMultipleCropCyclesDto) {
    if (!dto.plotIds || dto.plotIds.length === 0) {
      throw new BadRequestException('plotIds array is required and must not be empty');
    }

    const results: Awaited<ReturnType<typeof this.create>>[] = [];
    const errors: Array<{ plotId: string; error: string }> = [];

    const firstPlotId = dto.plotIds[0];
    const remainingPlotIds = dto.plotIds.slice(1);

    try {
      const firstDto: CreateCropCycleDto = {
        ...dto,
        plotId: firstPlotId,
      } as CreateCropCycleDto;
      const firstCycle = await this.create(firstDto);
      results.push(firstCycle);
    } catch (error) {
      errors.push({
        plotId: firstPlotId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }

    for (const plotId of remainingPlotIds) {
      try {
        const singleDto: CreateCropCycleDto = {
          ...dto,
          plotId,
          workflowOption: 'none',
          templateId: undefined,
          stages: undefined,
        } as unknown as CreateCropCycleDto;
        const cycle = await this.create(singleDto);
        results.push(cycle);
      } catch (error) {
        errors.push({
          plotId,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    if (results.length > 1) {
      const primaryId = results[0].id;
      const siblingIds = results.slice(1).map((r) => r.id);
      const allTasks = await this.prisma.task.findMany({
        where: { cropCycleId: primaryId },
      });
      const plotNames = results.map((r: any) => r.plot?.name).filter(Boolean);
      const combinedPlotName = plotNames.join(', ');
      if (combinedPlotName && allTasks.length > 0) {
        await this.prisma.task.updateMany({
          where: { cropCycleId: primaryId },
          data: { plotName: combinedPlotName },
        });
      }
    }

    return {
      created: results,
      errors: errors.length > 0 ? errors : undefined,
      total: results.length,
      failed: errors.length,
    };
  }

  async findAll(filters?: { plotId?: string; season?: string }) {
    const where: { plotId?: string; season?: string } = {};
    if (filters?.plotId) where.plotId = filters.plotId;
    if (filters?.season != null && filters.season !== '') where.season = filters.season;
    const list = await this.prisma.cropCycle.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        crop: true,
        plot: { include: { field: true } },
        tasks: { orderBy: { createdAt: 'asc' } },
      },
    });
    const enriched = list.map(enrichCycle);
    return Promise.all(
      enriched.map((c) =>
        this.addWorkflowTemplateName(c).then((cy) => this.enrichStagesWithWorkflowNames(cy))
      )
    );
  }

  async findByPlot(plotId: string) {
    const list = await this.prisma.cropCycle.findMany({
      where: { plotId },
      orderBy: { createdAt: 'desc' },
      include: {
        crop: true,
        plot: { include: { field: true } },
        tasks: { orderBy: { createdAt: 'asc' } },
      },
    });
    const enriched = list.map(enrichCycle);
    return Promise.all(
      enriched.map((c) =>
        this.addWorkflowTemplateName(c).then((cy) => this.enrichStagesWithWorkflowNames(cy))
      )
    );
  }

  async findOne(id: string) {
    const cropCycle = await this.prisma.cropCycle.findUnique({
      where: { id },
      include: {
        crop: true,
        plot: { include: { field: true } },
        tasks: { orderBy: { createdAt: 'asc' } },
      },
    });
    if (!cropCycle) {
      throw new NotFoundException(`CropCycle with id "${id}" not found`);
    }
    const enriched = enrichCycle(cropCycle);
    const withName = await this.addWorkflowTemplateName(enriched);
    return this.enrichStagesWithWorkflowNames(withName);
  }

  async update(id: string, dto: UpdateCropCycleDto) {
    const existing = await this.prisma.cropCycle.findUnique({
      where: { id },
      include: { crop: true },
    });
    if (!existing) {
      throw new NotFoundException(`CropCycle with id "${id}" not found`);
    }
    const data: Record<string, unknown> = { ...dto };
    if (dto.plantingDate) data.plantingDate = new Date(dto.plantingDate);
    if (dto.endDate) data.endDate = new Date(dto.endDate);
    if (dto.estimatedHarvestDate) data.estimatedHarvestDate = new Date(dto.estimatedHarvestDate);
    if (dto.actualHarvestStartDate)
      data.actualHarvestStartDate = new Date(dto.actualHarvestStartDate);
    if (dto.actualHarvestEndDate)
      data.actualHarvestEndDate = new Date(dto.actualHarvestEndDate);
    if (
      (dto.plantedArea != null || dto.plantCount != null) &&
      dto.plantDensity == null &&
      (dto.plantedArea ?? existing.plantedArea) != null &&
      (dto.plantCount ?? existing.plantCount) != null &&
      (dto.plantedArea ?? existing.plantedArea)! > 0
    ) {
      data.plantDensity =
        (dto.plantCount ?? existing.plantCount)! /
        (dto.plantedArea ?? existing.plantedArea)!;
    }
    if (
      (dto.status === 'completed' || dto.status === 'archived') &&
      !(dto.actualHarvestEndDate ?? existing.actualHarvestEndDate) &&
      !(dto.endDate ?? existing.endDate)
    ) {
      throw new BadRequestException(
        'Closing the cycle requires actualHarvestEndDate or endDate',
      );
    }
    if (
      dto.templateId !== undefined ||
      dto.stages !== undefined ||
      dto.workflowOption !== undefined
    ) {
      const workflowName = await this.resolveWorkflowName({
        templateId: (dto.templateId ?? existing.templateId) as string | null,
        workflowOption: (dto.workflowOption ?? existing.workflowOption) as string | null,
        stages: (dto.stages ?? existing.stages) as Array<{ workflowId?: string | null }> | null,
      });
      data.workflowTemplateName = workflowName ?? null;
    }

    const cycle = await this.prisma.cropCycle.update({
      where: { id },
      data: data as never,
      include: { crop: true, plot: { include: { field: true } }, tasks: true },
    });

    const farmId = cycle.plot?.field?.farmId;
    const cropName = cycle.crop?.product || cycle.crop?.nameOrDescription || 'Crop';
    const plotName = cycle.plot?.name || 'Plot';
    if (
      farmId &&
      dto.workflowOption === 'stages' &&
      Array.isArray(dto.stages) &&
      dto.stages.length > 0
    ) {
      const existingTaskWorkflowIds = new Set(
        (cycle.tasks ?? []).map((t) => t.workflowId).filter(Boolean)
      );
      for (let i = 0; i < dto.stages.length; i++) {
        const stage = dto.stages[i];
        const workflowIds = [
          ...(stage.workflowId ? [stage.workflowId] : []),
          ...(stage.subWorkflowIds || []),
        ];
        for (const workflowId of workflowIds) {
          if (existingTaskWorkflowIds.has(workflowId)) continue;
          const workflow = await this.prisma.workflow.findUnique({
            where: { id: workflowId },
          });
          if (!workflow) continue;
          const nodes = Array.isArray(workflow.nodes) ? (workflow.nodes as any[]) : [];
          const edges = Array.isArray(workflow.edges) ? (workflow.edges as any[]) : [];
          if (nodes.length === 0) continue;
          const firstTask = getFirstTaskFromWorkflow(
            nodes,
            edges,
            cycle.id,
            workflow.id,
            workflow.name,
            cropName,
            plotName,
            i,
            farmId,
          );
          if (firstTask) {
            await this.prisma.task.create({ data: firstTask });
            existingTaskWorkflowIds.add(workflowId);
          }
        }
      }
    }

    if (farmId) {
      if (dto.currentStatus && dto.currentStatus !== existing.currentStatus) {
        this.activitiesService.log({
          type: 'CROP_CYCLE_STAGE_CHANGED',
          title: 'Production cycle stage changed',
          description: `${cropName} in ${plotName} moved to ${dto.currentStatus}`,
          icon: 'material-symbols:swap-horiz-rounded',
          entityId: cycle.id,
          entityType: 'crop_cycle',
          farmId,
        });
      }
      
      if (dto.status && (dto.status === 'completed' || dto.status === 'archived') && existing.status !== dto.status) {
        this.activitiesService.log({
          type: 'CROP_CYCLE_COMPLETED',
          title: 'Production cycle completed',
          description: `${cropName} cycle in ${plotName} has been ${dto.status}`,
          icon: 'material-symbols:check-circle-outline-rounded',
          entityId: cycle.id,
          entityType: 'crop_cycle',
          farmId,
        });
      }
      
      if ((dto.actualHarvestStartDate || dto.actualHarvestEndDate || dto.actualYield) && 
          (!existing.actualHarvestStartDate || dto.actualYield !== existing.actualYield)) {
        const yieldInfo = dto.actualYield ? ` - ${dto.actualYield} ${cycle.yieldUnit || 'units'}` : '';
        this.activitiesService.log({
          type: 'HARVEST_RECORDED',
          title: 'Harvest recorded',
          description: `Harvest data recorded for ${cropName} in ${plotName}${yieldInfo}`,
          icon: 'material-symbols:agriculture-rounded',
          entityId: cycle.id,
          entityType: 'crop_cycle',
          farmId,
          metadata: dto.actualYield ? { yield: dto.actualYield, unit: cycle.yieldUnit } : undefined,
        });
      }
    }
    
    const enriched = enrichCycle(cycle);
    const withName = await this.addWorkflowTemplateName(enriched);
    return this.enrichStagesWithWorkflowNames(withName);
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.$transaction([
      this.prisma.task.deleteMany({ where: { cropCycleId: id } }),
      this.prisma.cropCycle.delete({ where: { id } })
    ]);
  }
}
