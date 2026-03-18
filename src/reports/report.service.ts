import { Injectable } from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

export enum ReportDataSource {
  CROPS = 'CROPS',
  CROP_CYCLES = 'CROP_CYCLES',
  CROP_SALES = 'CROP_SALES',
  ANIMALS = 'ANIMALS',
  LIVESTOCK_GROUPS = 'LIVESTOCK_GROUPS',
  SPRAY_RECORDS = 'SPRAY_RECORDS',
  SCOUTING_RECORDS = 'SCOUTING_RECORDS',
  DIAGNOSTICS = 'DIAGNOSTICS',
  WATER_CONSUMPTION = 'WATER_CONSUMPTION',
  PURCHASES = 'PURCHASES',
  PRODUCTS = 'PRODUCTS',
  SUPPLIERS = 'SUPPLIERS',
  PRODUCTION_UNITS = 'PRODUCTION_UNITS',
  SECTORS = 'SECTORS',
}

export type ReportDateRange = {
  from?: string | Date;
  to?: string | Date;
};

export interface ReportQuery {
  farmId: string;
  dataSource: ReportDataSource;
  filters?: Record<string, any>;
  groupBy?: string[];
  dateRange?: ReportDateRange;
  /**
   * Prisma field name to apply the date range to.
   * If omitted, we fall back to an internal map based on `dataSource`.
   */
  dateField?: string;
}

export interface ReportTemplateCreateInput {
  farmId: string;
  name: string;
  dataSource: ReportDataSource;
  filters: Record<string, any>;
  groupBy?: string[];
  columns?: string[];
}

type PrismaDelegate = {
  findMany(args: any): Promise<any[]>;
  groupBy?(args: any): Promise<any[]>;
};

interface ReportConfig {
  delegate: (prisma: PrismaClient) => PrismaDelegate;
  where: (farmId: string, filters?: Record<string, any>) => any;
  include?: any;
  numericFields?: string[];
}

const REPORT_CONFIG: Record<ReportDataSource, ReportConfig> = {
  [ReportDataSource.CROPS]: {
    delegate: (prisma) => prisma.crop,
    where: (_farmId, filters) => (filters ? { ...filters } : {}),
    include: {
      cropCycles: {
        include: {
          plot: {
            include: {
              field: true,
            },
          },
        },
      },
    },
  },
  [ReportDataSource.CROP_CYCLES]: {
    delegate: (prisma) => prisma.cropCycle,
    where: (farmId, filters) =>
      filters
        ? {
            plot: {
              field: {
                farmId,
              },
            },
            ...filters,
          }
        : {
            plot: {
              field: {
                farmId,
              },
            },
          },
    include: {
      crop: true,
      plot: {
        include: {
          field: true,
        },
      },
    },
    numericFields: ['plantedArea', 'plantCount', 'actualYield'],
  },
  [ReportDataSource.CROP_SALES]: {
    delegate: (prisma) => prisma.cropSale,
    where: (farmId, filters) =>
      filters
        ? {
            cropCycle: {
              plot: {
                field: {
                  farmId,
                },
              },
            },
            ...filters,
          }
        : {
            cropCycle: {
              plot: {
                field: {
                  farmId,
                },
              },
            },
          },
    include: {
      cropCycle: {
        include: {
          crop: true,
          plot: {
            include: {
              field: true,
            },
          },
        },
      },
    },
    numericFields: ['quantity', 'price'],
  },
  [ReportDataSource.ANIMALS]: {
    delegate: (prisma) => prisma.animal,
    where: (farmId, filters) => (filters ? { farmId, ...filters } : { farmId }),
    include: {
      farm: true,
      field: true,
    },
  },
  [ReportDataSource.LIVESTOCK_GROUPS]: {
    delegate: (prisma) => prisma.livestockGroup,
    where: (farmId, filters) =>
      filters
        ? {
            field: {
              farmId,
            },
            ...filters,
          }
        : {
            field: {
              farmId,
            },
          },
    include: {
      field: true,
    },
  },
  [ReportDataSource.SPRAY_RECORDS]: {
    delegate: (prisma) => prisma.sprayRecord,
    where: (farmId, filters) => (filters ? { farmId, ...filters } : { farmId }),
    include: {
      farm: true,
      plot: {
        include: {
          field: true,
        },
      },
      product: true,
    },
    numericFields: ['dose'],
  },
  [ReportDataSource.SCOUTING_RECORDS]: {
    delegate: (prisma) => prisma.scoutingRecord,
    where: (farmId, filters) => (filters ? { farmId, ...filters } : { farmId }),
    include: {
      farm: true,
      plot: {
        include: {
          field: true,
        },
      },
    },
  },
  [ReportDataSource.DIAGNOSTICS]: {
    delegate: (prisma) => prisma.diagnostic,
    where: (farmId, filters) =>
      filters
        ? {
            OR: [{ animal: { farmId } }, { scoutingRecord: { farmId } }],
            ...filters,
          }
        : {
            OR: [{ animal: { farmId } }, { scoutingRecord: { farmId } }],
          },
    include: {
      animal: true,
      scoutingRecord: {
        include: {
          plot: {
            include: {
              field: true,
            },
          },
        },
      },
    },
  },
  [ReportDataSource.WATER_CONSUMPTION]: {
    delegate: (prisma) => prisma.waterConsumption,
    where: (farmId, filters) => (filters ? { farmId, ...filters } : { farmId }),
    include: {
      farm: true,
    },
    numericFields: [],
  },
  [ReportDataSource.PURCHASES]: {
    delegate: (prisma) => prisma.purchase,
    where: (farmId, filters) => (filters ? { farmId, ...filters } : { farmId }),
    include: {
      supplier: true,
    },
    numericFields: ['total'],
  },
  [ReportDataSource.PRODUCTS]: {
    delegate: (prisma) => prisma.product,
    where: (farmId, filters) => (filters ? { farmId, ...filters } : { farmId }),
    include: {
      farm: true,
    },
  },
  [ReportDataSource.SUPPLIERS]: {
    delegate: (prisma) => prisma.supplier,
    where: (farmId, filters) => (filters ? { farmId, ...filters } : { farmId }),
    include: {
      farm: true,
    },
  },
  [ReportDataSource.PRODUCTION_UNITS]: {
    delegate: (prisma) => prisma.field,
    where: (farmId, filters) => (filters ? { farmId, ...filters } : { farmId }),
  },
  [ReportDataSource.SECTORS]: {
    delegate: (prisma) => prisma.plot,
    where: (farmId, filters) =>
      filters
        ? {
            field: {
              farmId,
            },
            ...filters,
          }
        : {
            field: {
              farmId,
            },
          },
    include: {
      field: true,
    },
  },
};

const DATE_FIELD_MAP: Partial<Record<ReportDataSource, string>> = {
  [ReportDataSource.CROP_CYCLES]: 'plantingDate',
  [ReportDataSource.CROP_SALES]: 'date',
  [ReportDataSource.ANIMALS]: 'birthDate',
  [ReportDataSource.SPRAY_RECORDS]: 'date',
  [ReportDataSource.SCOUTING_RECORDS]: 'observationDate',
  [ReportDataSource.DIAGNOSTICS]: 'diagnosisDate',
  [ReportDataSource.WATER_CONSUMPTION]: 'analysisDate',
  [ReportDataSource.PURCHASES]: 'date',
};

@Injectable()
export class ReportService {
  constructor(private readonly prisma: PrismaService) {}

  async getTemplates(farmId: string) {
    return this.prisma.reportTemplate.findMany({
      where: { farmId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createTemplate({
    farmId,
    name,
    dataSource,
    filters,
    groupBy = [],
    columns = [],
  }: ReportTemplateCreateInput) {
    return this.prisma.reportTemplate.create({
      data: {
        farmId,
        name,
        dataSource,
        filters: filters ?? {},
        groupBy,
        columns,
      },
    });
  }

  async deleteTemplate(id: string) {
    return this.prisma.reportTemplate.delete({
      where: { id },
    });
  }

  async query({ farmId, dataSource, filters, groupBy, dateRange, dateField }: ReportQuery): Promise<any[]> {
    const config = REPORT_CONFIG[dataSource];
    if (!config) {
      throw new Error(`Unsupported data source: ${dataSource}`);
    }

    const delegate = config.delegate(this.prisma);
    const where = config.where(farmId, filters);

    const activeDateField = dateField ?? DATE_FIELD_MAP[dataSource];
    const hasFrom = Boolean(dateRange?.from);
    const hasTo = Boolean(dateRange?.to);
    const hasDateRange = Boolean(activeDateField && (hasFrom || hasTo));

    const whereWithDate = hasDateRange
      ? {
          ...where,
          [activeDateField as string]: {
            ...(hasFrom ? { gte: new Date(dateRange!.from as any) } : {}),
            ...(hasTo ? { lte: new Date(dateRange!.to as any) } : {}),
          },
        }
      : where;

    if (groupBy && groupBy.length > 0 && 'groupBy' in delegate && typeof delegate.groupBy === 'function') {
      const numericFields = config.numericFields ?? [];

      const _sum = numericFields.reduce<Record<string, true>>((acc, field) => {
        acc[field] = true;
        return acc;
      }, {});

      const _avg = _sum;

      return (delegate as any).groupBy({
        by: groupBy as Prisma.Enumerable<any>,
        where: whereWithDate,
        _count: { _all: true },
        ...(Object.keys(_sum).length > 0 && { _sum }),
        ...(Object.keys(_avg).length > 0 && { _avg }),
      });
    }

    return delegate.findMany({
      where: whereWithDate,
      ...(config.include && { include: config.include }),
    });
  }
}

