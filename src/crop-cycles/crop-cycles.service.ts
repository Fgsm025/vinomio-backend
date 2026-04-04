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
import { getFirstTaskFromWorkflow } from '../services/workflow-to-tasks';

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

function asDate(d: Date | string | null | undefined): Date | null {
  if (d == null) return null;
  const x = d instanceof Date ? d : new Date(d);
  return Number.isNaN(x.getTime()) ? null : x;
}

/**
 * Fin de la última etapa (suma secuencial de estimatedDuration desde siembra).
 */
function endDateFromStagesAccumulated(
  plantingDate: Date,
  stages: unknown,
): Date | null {
  if (!Array.isArray(stages) || stages.length === 0) return null;
  const sorted = [...stages].sort(
    (a: { order?: number }, b: { order?: number }) =>
      (a.order ?? 0) - (b.order ?? 0),
  );
  let end = new Date(plantingDate);
  for (const raw of sorted) {
    const s = raw as {
      estimatedDuration?: { value?: number; unit?: string };
    };
    const ed = s.estimatedDuration;
    if (!ed || typeof ed.value !== 'number' || !Number.isFinite(ed.value)) {
      continue;
    }
    const unit = String(ed.unit ?? 'days').toLowerCase();
    if (unit === 'weeks') {
      end = addDays(end, ed.value * 7);
    } else if (unit === 'months') {
      const x = new Date(end);
      x.setMonth(x.getMonth() + ed.value);
      end = x;
    } else {
      end = addDays(end, ed.value);
    }
  }
  return end;
}

function resolveCycleEndForWaterFootprint(
  cropCycle: {
    plantingDate: Date;
    actualHarvestEndDate: Date | null;
    endDate: Date | null;
    estimatedHarvestDate: Date | null;
    stages: unknown;
  },
  crop: {
    plantingDays?: number | null;
    growingDays?: number | null;
    maturationDays?: number | null;
    veraisonDays?: number | null;
    harvestDays?: number | null;
  } | null,
): Date {
  const p = asDate(cropCycle.plantingDate);
  if (!p) {
    const fb = new Date();
    fb.setUTCFullYear(fb.getUTCFullYear() + 1);
    return fb;
  }
  const actual = asDate(cropCycle.actualHarvestEndDate);
  if (actual) return actual;
  const end = asDate(cropCycle.endDate);
  if (end) return end;
  const est = asDate(cropCycle.estimatedHarvestDate);
  if (est) return est;
  const fromStages = endDateFromStagesAccumulated(p, cropCycle.stages);
  if (fromStages) return fromStages;
  const phenologyDays = totalPhenologyDays(crop ?? {});
  if (phenologyDays != null && phenologyDays > 0) {
    return addDays(p, phenologyDays);
  }
  return addDays(p, 365);
}

function irrigationScheduleOverlapsCycle(
  schedule: { startAt: Date | null; endAt: Date | null },
  cycleStart: Date,
  cycleEnd: Date,
): boolean {
  const cStart = cycleStart.getTime();
  const cEnd = cycleEnd.getTime();
  const sStart = schedule.startAt?.getTime() ?? null;
  const sEnd = schedule.endAt?.getTime() ?? null;
  if (sStart === null && sEnd === null) {
    return true;
  }
  const effStart = sStart ?? Number.NEGATIVE_INFINITY;
  const effEnd = sEnd ?? Number.POSITIVE_INFINITY;
  return effStart <= cEnd && effEnd >= cStart;
}

/** waterVolume assumed m³; flowRate L/h; duration minutes */
function irrigationVolumeM3(schedule: {
  waterVolume: number | null;
  duration: number | null;
  flowRate: number | null;
}): number {
  if (schedule.waterVolume != null && schedule.waterVolume > 0) {
    return schedule.waterVolume;
  }
  const duration = schedule.duration;
  const flowRate = schedule.flowRate;
  if (duration == null || flowRate == null || duration <= 0 || flowRate <= 0) {
    return 0;
  }
  return (duration / 60) * (flowRate / 1000);
}

function utcCalendarDayKey(d: Date | string): string {
  const x = d instanceof Date ? d : new Date(d);
  return `${x.getUTCFullYear()}-${String(x.getUTCMonth() + 1).padStart(2, '0')}-${String(x.getUTCDate()).padStart(2, '0')}`;
}

/**
 * mm por día cuando no hay amountMm (flujo salud / intensidad).
 * Debe coincidir con `INTENSITY_OPTIONS` en el front (health rainfall).
 * Valores por defecto cuando el usuario solo elige intensidad (sin pluviómetro).
 */
function approxMmFromIntensity(
  intensity: string | null | undefined,
): number | null {
  if (intensity == null || typeof intensity !== 'string') return null;
  const k = intensity
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '_')
    .replace(/-/g, '_');
  const map: Record<string, number> = {
    drizzle: 2,
    light: 5,
    light_rain: 5,
    moderate: 5,
    moderate_rain: 5,
    heavy: 15,
    heavy_rain: 15,
    very_heavy: 30,
    very_heavy_rain: 30,
  };
  const mm = map[k];
  return mm != null && Number.isFinite(mm) ? mm : null;
}

function effectiveRainMm(ev: {
  amountMm: number | null;
  intensity: string | null;
}): { mm: number; fromIntensityFallback: boolean } | null {
  if (ev.amountMm != null && ev.amountMm > 0 && Number.isFinite(ev.amountMm)) {
    return { mm: ev.amountMm, fromIntensityFallback: false };
  }
  const approx = approxMmFromIntensity(ev.intensity);
  if (approx != null && approx > 0) {
    return { mm: approx, fromIntensityFallback: true };
  }
  return null;
}

const DEFAULT_RAINFALL_SURFACE_HA = 1;

/** plot ha > 0 → plot; else planted ha > 0 → planted; else 1 ha (estimated volume, not empty). */
function resolveEffectiveSurfaceHaForRainfall(
  plotSurfaceHa: number | null | undefined,
  plantedAreaHa: number | null | undefined,
): number {
  const plot =
    plotSurfaceHa != null && plotSurfaceHa > 0 && Number.isFinite(plotSurfaceHa)
      ? plotSurfaceHa
      : 0;
  if (plot > 0) return plot;
  const planted =
    plantedAreaHa != null && plantedAreaHa > 0 && Number.isFinite(plantedAreaHa)
      ? plantedAreaHa
      : 0;
  if (planted > 0) return planted;
  return DEFAULT_RAINFALL_SURFACE_HA;
}

/** Max mm per UTC day, then volume m³ over plot surface (mm × m² / 1000). */
function rainfallM3FromEventsDedupedByDay(
  events: {
    amountMm: number | null;
    startDate: Date;
    intensity: string | null;
  }[],
  surfaceM2: number,
): { m3: number; usedIntensityFallback: boolean; rainfallMmTotal: number } {
  if (surfaceM2 <= 0) {
    return { m3: 0, usedIntensityFallback: false, rainfallMmTotal: 0 };
  }
  const byDay = new Map<string, number>();
  let usedIntensityFallback = false;
  for (const ev of events) {
    const eff = effectiveRainMm(ev);
    if (eff == null) continue;
    if (eff.fromIntensityFallback) usedIntensityFallback = true;
    const key = utcCalendarDayKey(ev.startDate);
    byDay.set(key, Math.max(byDay.get(key) ?? 0, eff.mm));
  }
  let sumMm = 0;
  for (const mm of byDay.values()) sumMm += mm;
  return {
    m3: (sumMm * surfaceM2) / 1000,
    usedIntensityFallback,
    rainfallMmTotal: sumMm,
  };
}

/** Harvest mass → kg for footprint (e.g. tons → kg). */
function harvestMassToKg(
  value: number,
  unit: string | null | undefined,
): number {
  if (!Number.isFinite(value) || value <= 0) return 0;
  const u = (unit ?? 'kg').toLowerCase();
  if (u === 'tons' || u === 'ton' || u === 't') return value * 1000;
  return value;
}

/**
 * Prefer cosecha real; si no, rendimiento esperado del cultivo × ha del ciclo (plantedArea o superficie del lote).
 */
function resolveYieldKgForFootprint(
  cropCycle: {
    actualYield: number | null;
    yieldUnit: string | null;
    plantedArea: number | null;
    plot: { surface: number } | null;
  },
  crop: {
    estimatedYieldPerHa: number | null;
    yieldUnit: string | null;
  } | null,
): { yieldKg: number; source: 'actual' | 'estimated' } | null {
  if (cropCycle.actualYield != null && cropCycle.actualYield > 0) {
    const kg = harvestMassToKg(cropCycle.actualYield, cropCycle.yieldUnit);
    if (kg > 0) return { yieldKg: kg, source: 'actual' };
  }
  if (!crop) return null;
  const ha =
    cropCycle.plantedArea != null && cropCycle.plantedArea > 0
      ? cropCycle.plantedArea
      : cropCycle.plot != null && cropCycle.plot.surface > 0
        ? cropCycle.plot.surface
        : null;
  const perHa = crop.estimatedYieldPerHa;
  if (ha == null || perHa == null || perHa <= 0) return null;
  const kgPerHa = harvestMassToKg(perHa, crop.yieldUnit);
  if (kgPerHa <= 0) return null;
  return { yieldKg: ha * kgPerHa, source: 'estimated' };
}

type CropRowForFootprint = {
  productionType: string | null;
  cuttingsPerExtraction: number | null;
};

function computeMotherPropagatedUnits(
  cropCycle: {
    actualYield: number | null;
    yieldUnit: string | null;
    plantCount: number | null;
  },
  crop: CropRowForFootprint | null,
): { units: number; source: 'actual' | 'estimated' } | null {
  if (cropCycle.actualYield != null && cropCycle.actualYield > 0) {
    const yu = (cropCycle.yieldUnit ?? 'kg').toLowerCase();
    if (yu === 'units') {
      return { units: cropCycle.actualYield, source: 'actual' };
    }
  }
  const mothers = cropCycle.plantCount;
  const cpe = crop?.cuttingsPerExtraction;
  if (mothers != null && mothers > 0 && cpe != null && cpe > 0) {
    return { units: mothers * cpe, source: 'estimated' };
  }
  return null;
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
    daysToHarvest = Math.ceil(
      (estimated.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
    );
    const total = Math.ceil(
      (estimated.getTime() - planting.getTime()) / (1000 * 60 * 60 * 24),
    );
    if (total > 0) {
      const elapsed = Math.ceil(
        (now.getTime() - planting.getTime()) / (1000 * 60 * 60 * 24),
      );
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

  private async getDefaultAssigneeForFarm(
    farmId: string,
  ): Promise<string | null> {
    const owner = await this.prisma.userFarm.findFirst({
      where: { farmId, role: 'OWNER' },
      select: { userId: true },
    });
    return owner?.userId ?? null;
  }

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
    cycle: T,
  ): Promise<T & { workflowTemplateName?: string | null }> {
    const existing =
      typeof cycle.workflowTemplateName === 'string' &&
      cycle.workflowTemplateName !== ''
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
    cycle: T,
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
      const workflowName = wid ? (nameById.get(wid) ?? null) : null;
      return { ...s, workflowName };
    });
    return { ...cycle, stages: enrichedStages };
  }

  async create(dto: CreateCropCycleDto) {
    const crop = await this.prisma.crop.findUnique({
      where: { id: dto.cropId },
    });
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
      ...(dto.region && { region: dto.region }),
      ...(dto.endDate && { endDate: new Date(dto.endDate) }),
      ...(dto.endReason && { endReason: dto.endReason }),
      ...(dto.plantedArea != null && { plantedArea: dto.plantedArea }),
      ...(dto.plantCount != null && { plantCount: dto.plantCount }),
      ...(plantDensity != null && { plantDensity }),
      ...(dto.phenologyTemplateId && {
        phenologyTemplateId: dto.phenologyTemplateId,
      }),
      ...(dto.manualAdjustments && {
        manualAdjustments: dto.manualAdjustments,
      }),
      ...(dto.workflowOption && { workflowOption: dto.workflowOption }),
      ...(dto.templateId && { templateId: dto.templateId }),
      ...(dto.stages && { stages: dto.stages }),
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
      ...(dto.nextPlannedCropId && {
        nextPlannedCropId: dto.nextPlannedCropId,
      }),
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
    const cropName = cycle.crop?.product || '';
    const plotName = cycle.plot?.name || '';
    const cycleDisplayName =
      cycle.name || `${cropName} - ${plotName}`.trim() || 'Ciclo';

    if (farmId && dto.workflowOption === 'template' && dto.templateId) {
      const defaultAssignee = await this.getDefaultAssigneeForFarm(farmId);
      const workflow = await this.prisma.workflow.findUnique({
        where: { id: dto.templateId },
      });
      if (workflow) {
        const nodes = Array.isArray(workflow.nodes)
          ? (workflow.nodes as any[])
          : [];
        const edges = Array.isArray(workflow.edges)
          ? (workflow.edges as any[])
          : [];
        if (nodes.length > 0) {
          const firstTask = getFirstTaskFromWorkflow(
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
          if (firstTask) {
            await this.prisma.task.create({
              data: {
                ...firstTask,
                ...(defaultAssignee && { assignedTo: defaultAssignee }),
              },
            });
          }
        }
      }
    }

    if (farmId && dto.workflowOption === 'stages' && dto.stages?.length > 0) {
      const defaultAssignee = await this.getDefaultAssigneeForFarm(farmId);
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

          const nodes = Array.isArray(workflow.nodes)
            ? (workflow.nodes as any[])
            : [];
          const edges = Array.isArray(workflow.edges)
            ? (workflow.edges as any[])
            : [];

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
            await this.prisma.task.create({
              data: {
                ...firstTask,
                ...(defaultAssignee && { assignedTo: defaultAssignee }),
              },
            });
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
      throw new BadRequestException(
        'plotIds array is required and must not be empty',
      );
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
    if (filters?.season != null && filters.season !== '')
      where.season = filters.season;
    const list = await this.prisma.cropCycle.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        crop: true,
        plot: { include: { field: true } },
        tasks: { orderBy: { createdAt: 'asc' } },
        sales: { orderBy: { date: 'desc' } },
      },
    });
    const enriched = list.map(enrichCycle);
    return Promise.all(
      enriched.map((c) =>
        this.addWorkflowTemplateName(c).then((cy) =>
          this.enrichStagesWithWorkflowNames(cy),
        ),
      ),
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
        sales: { orderBy: { date: 'desc' } },
      },
    });
    const enriched = list.map(enrichCycle);
    return Promise.all(
      enriched.map((c) =>
        this.addWorkflowTemplateName(c).then((cy) =>
          this.enrichStagesWithWorkflowNames(cy),
        ),
      ),
    );
  }

  async findOne(id: string) {
    const cropCycle = await this.prisma.cropCycle.findUnique({
      where: { id },
      include: {
        crop: true,
        plot: { include: { field: true } },
        tasks: { orderBy: { createdAt: 'asc' } },
        sales: { orderBy: { date: 'desc' } },
      },
    });
    if (!cropCycle) {
      throw new NotFoundException(`CropCycle with id "${id}" not found`);
    }
    const enriched = enrichCycle(cropCycle);
    const withName = await this.addWorkflowTemplateName(enriched);
    return this.enrichStagesWithWorkflowNames(withName);
  }

  /**
   * @param rainfallFarmIdFromJwt farmId del token (misma finca que al registrar lluvia); respaldo si `Field.farmId` viene null en BD.
   */
  async getWaterFootprint(id: string, rainfallFarmIdFromJwt?: string | null) {
    const cropCycle = await this.prisma.cropCycle.findUnique({
      where: { id },
      include: {
        crop: true,
        plot: {
          include: {
            field: true,
            plotsOnIrrigationSchedule: {
              include: { irrigationSchedule: true },
            },
          },
        },
      },
    });
    if (!cropCycle) {
      throw new NotFoundException(`CropCycle with id "${id}" not found`);
    }

    const cycleStart = cropCycle.plantingDate;
    /** Fin del ciclo para proyección: cosecha real, endDate, estimada, suma de etapas o fenología — no “hoy”, para incluir lluvia futura dentro del ciclo. */
    const cycleEnd = resolveCycleEndForWaterFootprint(
      cropCycle,
      cropCycle.crop ?? null,
    );
    /** Lluvia atribuible al ciclo: [siembra, fin de ciclo] (misma finca; sin exigir cropCycleId). Incluye fechas futuras dentro del ciclo proyectado, no “hasta hoy”. */
    let rainfallWindowStart = cycleStart;
    const rainfallWindowEnd = cycleEnd;
    if (rainfallWindowStart.getTime() > rainfallWindowEnd.getTime()) {
      rainfallWindowStart = addDays(rainfallWindowEnd, -1);
    }

    const rainfallHa = resolveEffectiveSurfaceHaForRainfall(
      cropCycle.plot?.surface,
      cropCycle.plantedArea,
    );
    const surfaceM2 = rainfallHa * 10_000;

    let irrigationM3 = 0;
    const links = cropCycle.plot?.plotsOnIrrigationSchedule ?? [];
    for (const link of links) {
      const schedule = link.irrigationSchedule;
      if (!irrigationScheduleOverlapsCycle(schedule, cycleStart, cycleEnd)) {
        continue;
      }
      irrigationM3 += irrigationVolumeM3(schedule);
    }

    const fieldFarmId = cropCycle.plot?.field?.farmId ?? null;
    /** Misma finca que al crear eventos de lluvia (JWT); cubre `Field.farmId` null en BD. */
    const farmIdForRainfall = fieldFarmId ?? rainfallFarmIdFromJwt ?? null;
    const plotId = cropCycle.plotId;
    const fieldId = cropCycle.plot?.fieldId ?? null;

    /** Lluvia a nivel finca: por `farmId` + rango de fechas (no exige `cropCycleId`). Respaldo: ciclo/plot/campo. */
    const rainfallEvents =
      farmIdForRainfall != null
        ? await this.prisma.rainfallEvent.findMany({
            where: {
              farmId: farmIdForRainfall,
              startDate: { gte: rainfallWindowStart, lte: rainfallWindowEnd },
            },
          })
        : await this.prisma.rainfallEvent.findMany({
            where: {
              startDate: { gte: rainfallWindowStart, lte: rainfallWindowEnd },
              OR: [
                { cropCycleId: cropCycle.id },
                { plotId },
                ...(fieldId ? [{ fieldId }] : []),
              ],
            },
          });

    const agg = rainfallM3FromEventsDedupedByDay(rainfallEvents, surfaceM2);
    const rainfallM3 = agg.m3;
    const rainfallUsedIntensityEstimate = agg.usedIntensityFallback;
    const rainfallMmTotal = agg.rainfallMmTotal;
    let rainfallLastDate: string | null = null;
    if (rainfallEvents.length > 0) {
      const last = rainfallEvents.reduce((a, b) =>
        a.startDate > b.startDate ? a : b,
      );
      rainfallLastDate = last.startDate.toISOString();
    }

    console.log('[getWaterFootprint] rainfall Prisma + agregado', {
      cycleId: id,
      fieldFarmId,
      rainfallFarmIdFromJwt,
      farmIdForRainfall,
      cycleEndResolved: cycleEnd.toISOString(),
      rainfallWindowStart: rainfallWindowStart.toISOString(),
      rainfallWindowEnd: rainfallWindowEnd.toISOString(),
      prismaRainfallWhere:
        farmIdForRainfall != null
          ? {
              farmId: farmIdForRainfall,
              startDate: {
                gte: rainfallWindowStart.toISOString(),
                lte: rainfallWindowEnd.toISOString(),
              },
            }
          : {
              OR: [
                { cropCycleId: cropCycle.id },
                { plotId },
                ...(fieldId ? [{ fieldId }] : []),
              ],
              startDate: {
                gte: rainfallWindowStart.toISOString(),
                lte: rainfallWindowEnd.toISOString(),
              },
            },
      eventsFound: rainfallEvents.length,
      surfaceM2,
      rainfallHa,
      rainfallM3,
      rainfallMmTotal,
      rainfallUsedIntensityEstimate,
      sampleEvents: rainfallEvents.slice(0, 12).map((e) => ({
        id: e.id,
        startDate: e.startDate.toISOString(),
        intensity: e.intensity,
        amountMm: e.amountMm,
      })),
    });

    const plotSurfaceHa = cropCycle.plot?.surface ?? 0;

    const totalM3 = irrigationM3 + rainfallM3;
    const crop = cropCycle.crop;
    const productionType = crop?.productionType ?? 'traditional';

    const areaHa =
      cropCycle.plantedArea != null && cropCycle.plantedArea > 0
        ? cropCycle.plantedArea
        : plotSurfaceHa > 0
          ? plotSurfaceHa
          : null;

    let yieldKg: number | null = null;
    let yieldSource: 'actual' | 'estimated' | null = null;
    let waterFootprintM3perKg: number | null = null;

    let motherPlantCount: number | null = null;
    let waterM3PerMotherPlant: number | null = null;
    let propagatedUnits: number | null = null;
    let propagatedUnitsSource: 'actual' | 'estimated' | null = null;
    let waterM3PerPropagatedUnit: number | null = null;

    let waterM3PerHa: number | null = null;
    let waterM3PerPlant: number | null = null;

    if (productionType === 'mother-plant') {
      motherPlantCount = cropCycle.plantCount ?? null;
      if (motherPlantCount != null && motherPlantCount > 0) {
        waterM3PerMotherPlant = totalM3 / motherPlantCount;
      }
      const prop = computeMotherPropagatedUnits(cropCycle, crop);
      if (prop != null && prop.units > 0) {
        propagatedUnits = prop.units;
        propagatedUnitsSource = prop.source;
        waterM3PerPropagatedUnit = totalM3 / prop.units;
      }
    } else if (productionType === 'permanent-crop') {
      if (areaHa != null && areaHa > 0) {
        waterM3PerHa = totalM3 / areaHa;
      }
      const pc = cropCycle.plantCount ?? null;
      if (pc != null && pc > 0) {
        waterM3PerPlant = totalM3 / pc;
      }
    } else {
      const resolved = resolveYieldKgForFootprint(cropCycle, crop);
      yieldKg = resolved?.yieldKg ?? null;
      yieldSource = resolved?.source ?? null;
      waterFootprintM3perKg =
        resolved != null && resolved.yieldKg > 0
          ? totalM3 / resolved.yieldKg
          : null;
    }

    return {
      irrigationM3,
      rainfallM3,
      rainfallMmTotal,
      rainfallSurfaceHaUsed: rainfallHa,
      rainfallLastDate,
      rainfallUsedIntensityEstimate,
      totalM3,
      productionType,
      yieldKg,
      yieldSource,
      waterFootprintM3perKg,
      motherPlantCount,
      waterM3PerMotherPlant,
      propagatedUnits,
      propagatedUnitsSource,
      waterM3PerPropagatedUnit,
      areaHa,
      waterM3PerHa,
      plantCount: cropCycle.plantCount ?? null,
      waterM3PerPlant,
    };
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
    if (dto.estimatedHarvestDate)
      data.estimatedHarvestDate = new Date(dto.estimatedHarvestDate);
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
        workflowOption: (dto.workflowOption ?? existing.workflowOption) as
          | string
          | null,
        stages: (dto.stages ?? existing.stages) as Array<{
          workflowId?: string | null;
        }> | null,
      });
      data.workflowTemplateName = workflowName ?? null;
    }

    const cycle = await this.prisma.cropCycle.update({
      where: { id },
      data: data as never,
      include: { crop: true, plot: { include: { field: true } }, tasks: true },
    });

    const farmId = cycle.plot?.field?.farmId;
    const cropName = cycle.crop?.product || 'Crop';
    const plotName = cycle.plot?.name || 'Plot';
    if (
      farmId &&
      dto.workflowOption === 'stages' &&
      Array.isArray(dto.stages) &&
      dto.stages.length > 0
    ) {
      const existingTaskWorkflowIds = new Set(
        (cycle.tasks ?? []).map((t) => t.workflowId).filter(Boolean),
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
          const nodes = Array.isArray(workflow.nodes)
            ? (workflow.nodes as any[])
            : [];
          const edges = Array.isArray(workflow.edges)
            ? (workflow.edges as any[])
            : [];
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

      if (
        dto.status &&
        (dto.status === 'completed' || dto.status === 'archived') &&
        existing.status !== dto.status
      ) {
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

      if (
        (dto.actualHarvestStartDate ||
          dto.actualHarvestEndDate ||
          dto.actualYield) &&
        (!existing.actualHarvestStartDate ||
          dto.actualYield !== existing.actualYield)
      ) {
        const yieldInfo = dto.actualYield
          ? ` - ${dto.actualYield} ${cycle.yieldUnit || 'units'}`
          : '';
        this.activitiesService.log({
          type: 'HARVEST_RECORDED',
          title: 'Harvest recorded',
          description: `Harvest data recorded for ${cropName} in ${plotName}${yieldInfo}`,
          icon: 'material-symbols:agriculture-rounded',
          entityId: cycle.id,
          entityType: 'crop_cycle',
          farmId,
          metadata: dto.actualYield
            ? { yield: dto.actualYield, unit: cycle.yieldUnit }
            : undefined,
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
      this.prisma.cropCycle.delete({ where: { id } }),
    ]);
  }
}
