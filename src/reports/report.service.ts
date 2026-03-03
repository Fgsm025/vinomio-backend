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

export interface ReportQuery {
  farmId: string;
  dataSource: ReportDataSource;
  filters?: Record<string, any>;
  groupBy?: string[];
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

@Injectable()
export class ReportService {
  constructor(private readonly prisma: PrismaService) {}

  async query({ farmId, dataSource, filters, groupBy }: ReportQuery): Promise<any[]> {
    const config = REPORT_CONFIG[dataSource];
    if (!config) {
      throw new Error(`Unsupported data source: ${dataSource}`);
    }

    const delegate = config.delegate(this.prisma);
    const where = config.where(farmId, filters);

    if (groupBy && groupBy.length > 0 && 'groupBy' in delegate && typeof delegate.groupBy === 'function') {
      const numericFields = config.numericFields ?? [];

      const _sum = numericFields.reduce<Record<string, true>>((acc, field) => {
        acc[field] = true;
        return acc;
      }, {});

      const _avg = _sum;

      return (delegate as any).groupBy({
        by: groupBy as Prisma.Enumerable<any>,
        where,
        _count: { _all: true },
        ...(Object.keys(_sum).length > 0 && { _sum }),
        ...(Object.keys(_avg).length > 0 && { _avg }),
      });
    }

    return delegate.findMany({
      where,
      ...(config.include && { include: config.include }),
    });
  }
}

