import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface CampaignSummary {
  season: string;
  seasonId: string;
  activeCyclesCount: number;
  completedCyclesCount: number;
  totalArea: number;
  totalYield: number;
  status: 'active' | 'completed';
  startDate: string | null;
  estimatedEndDate: string | null;
}

export function seasonToSlug(season: string): string {
  return season.replace(/\//g, '--');
}

export function slugToSeason(slug: string): string {
  return slug.replace(/--/g, '/');
}

@Injectable()
export class CampaignsService {
  constructor(private readonly prisma: PrismaService) {}

  private async cyclesWhereFarm(farmId: string | undefined) {
    if (!farmId) return [];
    const fieldIds = await this.prisma.field
      .findMany({
        where: { farmId },
        select: { id: true },
      })
      .then((r) => r.map((x) => x.id));
    if (fieldIds.length === 0) return [];
    return this.prisma.cropCycle.findMany({
      where: {
        OR: [
          { fieldId: { in: fieldIds } },
          { plot: { fieldId: { in: fieldIds } } },
        ],
      },
      include: { crop: true },
      orderBy: { plantingDate: 'asc' },
    });
  }

  async findAll(farmId?: string): Promise<CampaignSummary[]> {
    const cycles = await this.cyclesWhereFarm(farmId);
    const bySeason = new Map<
      string,
      {
        cycles: (typeof cycles)[0][];
      }
    >();
    for (const c of cycles) {
      const season = c.season || 'No season';
      if (!bySeason.has(season)) {
        bySeason.set(season, { cycles: [] });
      }
      bySeason.get(season)!.cycles.push(c);
    }
    const result: CampaignSummary[] = [];
    for (const [season, { cycles: list }] of bySeason.entries()) {
      const active = list.filter((x) => x.status === 'active');
      const completed = list.filter((x) => x.status === 'completed' || x.status === 'archived');
      const totalArea = list.reduce((s, x) => s + (x.plantedArea ?? 0), 0);
      const totalYield = list.reduce((s, x) => s + (x.actualYield ?? 0), 0);
      const startDate =
        list.length > 0
          ? list.reduce(
              (min, x) =>
                new Date(x.plantingDate) < new Date(min)
                  ? x.plantingDate
                  : min,
              list[0].plantingDate,
            )
          : null;
      const withEst = list.filter(
        (x) => x.estimatedHarvestDate != null,
      );
      const estimatedEndDate =
        withEst.length > 0
          ? withEst.reduce((max, x) =>
              new Date(x.estimatedHarvestDate!) > new Date(max)
                ? x.estimatedHarvestDate!
                : max,
            withEst[0].estimatedHarvestDate!)
          : null;
      result.push({
        season,
        seasonId: seasonToSlug(season),
        activeCyclesCount: active.length,
        completedCyclesCount: completed.length,
        totalArea,
        totalYield,
        status: active.length > 0 ? 'active' : 'completed',
        startDate: startDate ? (startDate as Date).toISOString().split('T')[0] : null,
        estimatedEndDate: estimatedEndDate
          ? (estimatedEndDate as Date).toISOString().split('T')[0]
          : null,
      });
    }
    result.sort((a, b) => (b.season < a.season ? -1 : 1));
    return result;
  }

  async findBySeason(seasonSlug: string, farmId?: string) {
    const season = slugToSeason(seasonSlug);
    const baseCycles = await this.cyclesWhereFarm(farmId);
    const seasonCycleIds = baseCycles.filter((c) => c.season === season).map((c) => c.id);
    const cycles = await this.prisma.cropCycle.findMany({
      where: { id: { in: seasonCycleIds } },
      include: { crop: true, plot: true, field: true },
      orderBy: { plantingDate: 'asc' },
    });
    if (cycles.length === 0 && season) {
      return {
        season,
        seasonId: seasonToSlug(season),
        cycles: [],
        stats: {
          activeCyclesCount: 0,
          totalArea: 0,
          totalYield: 0,
          byProduct: [],
          byPlot: [],
          timeline: [],
        },
        startDate: null,
        estimatedEndDate: null,
      };
    }
    const active = cycles.filter((x) => x.status === 'active');
    const totalArea = cycles.reduce((s, x) => s + (x.plantedArea ?? 0), 0);
    const totalYield = cycles.reduce((s, x) => s + (x.actualYield ?? 0), 0);
    const byProduct = new Map<string, { cycles: typeof cycles; yield: number }>();
    const byPlot = new Map<string, typeof cycles>();
    for (const c of cycles) {
      const key = c.crop?.product ?? 'Sin producto';
      if (!byProduct.has(key)) byProduct.set(key, { cycles: [], yield: 0 });
      const entry = byProduct.get(key)!;
      entry.cycles.push(c);
      entry.yield += c.actualYield ?? 0;
      const plot = c.plot?.name ?? 'Sin plot';
      if (!byPlot.has(plot)) byPlot.set(plot, []);
      byPlot.get(plot)!.push(c);
    }
    const startDate =
      cycles.length > 0
        ? cycles.reduce(
            (min, x) => (x.plantingDate < min ? x.plantingDate : min),
            cycles[0].plantingDate,
          )
        : null;
    const withEst = cycles.filter((x) => x.estimatedHarvestDate != null);
    const estimatedEndDate =
      withEst.length > 0
        ? withEst.reduce(
            (max, x) =>
              (x.estimatedHarvestDate! > max ? x.estimatedHarvestDate! : max),
            withEst[0].estimatedHarvestDate!,
          )
        : null;
    return {
      season,
      seasonId: seasonToSlug(season),
      cycles,
      stats: {
        activeCyclesCount: active.length,
        totalArea,
        totalYield,
        byProduct: Array.from(byProduct.entries()).map(([name, v]) => ({
          product: name,
          cyclesCount: v.cycles.length,
          yield: v.yield,
        })),
        byPlot: Array.from(byPlot.entries()).map(([name, list]) => ({
          plot: name,
          cyclesCount: list.length,
        })),
        timeline: cycles.map((c) => ({
          id: c.id,
          product: c.crop?.product,
          plantingDate: (c.plantingDate as Date).toISOString().split('T')[0],
          estimatedHarvestDate: c.estimatedHarvestDate
            ? (c.estimatedHarvestDate as Date).toISOString().split('T')[0]
            : null,
        })),
      },
      startDate: startDate ? (startDate as Date).toISOString().split('T')[0] : null,
      estimatedEndDate: estimatedEndDate
        ? (estimatedEndDate as Date).toISOString().split('T')[0]
        : null,
    };
  }
}
