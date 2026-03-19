import { ForbiddenException, Injectable, OnModuleDestroy, OnModuleInit, UnauthorizedException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { getPrismaFarmId } from './prisma-farm-context';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly farmScopedPrisma: any;

  constructor() {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error('DATABASE_URL environment variable is required');
    }
    const pool = new Pool({ connectionString });
    super({ adapter: new PrismaPg(pool) });

    // Prisma 7.3 no tiene `$use` (middleware). En su lugar usamos
    // `$extends` para interceptar queries a nivel cliente.
    //
    // Nota: devolvemos delegados extendidos para los modelos críticos
    // (Crop/Facility/WaterSource/Workflow) para que toda la app quede aislada.
    this.farmScopedPrisma = this.$extends({
      query: {
        crop: {
          findMany: ({ args, query }) => {
            const farmId = getPrismaFarmId();
            if (!farmId) throw new UnauthorizedException('Missing farm context');
            args.where = { ...(args.where ?? {}), farmId };
            return query(args);
          },
          findFirst: ({ args, query }) => {
            const farmId = getPrismaFarmId();
            if (!farmId) throw new UnauthorizedException('Missing farm context');
            args.where = { ...(args.where ?? {}), farmId };
            return query(args);
          },
          findUnique: ({ args, query }) => {
            const farmId = getPrismaFarmId();
            if (!farmId) throw new UnauthorizedException('Missing farm context');
            args.where = { ...(args.where ?? {}), farmId };
            return query(args);
          },
          count: ({ args, query }) => {
            const farmId = getPrismaFarmId();
            if (!farmId) throw new UnauthorizedException('Missing farm context');
            args.where = { ...(args.where ?? {}), farmId };
            return query(args);
          },
          aggregate: ({ args, query }) => {
            const farmId = getPrismaFarmId();
            if (!farmId) throw new UnauthorizedException('Missing farm context');
            args.where = { ...(args.where ?? {}), farmId };
            return query(args);
          },
          create: ({ args, query }) => {
            const farmId = getPrismaFarmId();
            if (!farmId) {
              if (args.data?.farmId) return query(args);
              throw new UnauthorizedException('Missing farm context');
            }
            (args as any).data = { ...(args.data ?? {}), farmId };
            return query(args);
          },
          update: ({ args, query }) => {
            const farmId = getPrismaFarmId();
            if (!farmId) {
              if (args.where?.farmId) return query(args);
              throw new UnauthorizedException('Missing farm context');
            }
            args.where = { ...(args.where ?? {}), farmId };
            (args as any).data = { ...(args.data ?? {}), farmId };
            return query(args);
          },
          delete: ({ args, query }) => {
            const farmId = getPrismaFarmId();
            if (!farmId) {
              if (args.where?.farmId) return query(args);
              throw new UnauthorizedException('Missing farm context');
            }
            args.where = { ...(args.where ?? {}), farmId };
            return query(args);
          },
          updateMany: ({ args, query }) => {
            const farmId = getPrismaFarmId();
            if (!farmId) {
              if (args.where?.farmId) return query(args);
              throw new UnauthorizedException('Missing farm context');
            }
            args.where = { ...(args.where ?? {}), farmId };
            (args as any).data = { ...(args.data ?? {}), farmId };
            return query(args);
          },
          deleteMany: ({ args, query }) => {
            const farmId = getPrismaFarmId();
            if (!farmId) {
              if (args.where?.farmId) return query(args);
              throw new UnauthorizedException('Missing farm context');
            }
            args.where = { ...(args.where ?? {}), farmId };
            return query(args);
          },
          upsert: ({ args, query }) => {
            const farmId = getPrismaFarmId();
            if (!farmId) {
              if (args.where?.farmId) return query(args);
              throw new UnauthorizedException('Missing farm context');
            }
            args.where = { ...(args.where ?? {}), farmId };
            (args as any).create = { ...(args.create ?? {}), farmId };
            (args as any).update = { ...(args.update ?? {}), farmId };
            return query(args);
          },
        },
        facility: {
          findMany: ({ args, query }) => {
            const farmId = getPrismaFarmId();
            if (!farmId) throw new UnauthorizedException('Missing farm context');
            args.where = { ...(args.where ?? {}), farmId };
            return query(args);
          },
          findFirst: ({ args, query }) => {
            const farmId = getPrismaFarmId();
            if (!farmId) throw new UnauthorizedException('Missing farm context');
            args.where = { ...(args.where ?? {}), farmId };
            return query(args);
          },
          findUnique: ({ args, query }) => {
            const farmId = getPrismaFarmId();
            if (!farmId) throw new UnauthorizedException('Missing farm context');
            args.where = { ...(args.where ?? {}), farmId };
            return query(args);
          },
          count: ({ args, query }) => {
            const farmId = getPrismaFarmId();
            if (!farmId) throw new UnauthorizedException('Missing farm context');
            args.where = { ...(args.where ?? {}), farmId };
            return query(args);
          },
          aggregate: ({ args, query }) => {
            const farmId = getPrismaFarmId();
            if (!farmId) throw new UnauthorizedException('Missing farm context');
            args.where = { ...(args.where ?? {}), farmId };
            return query(args);
          },
          create: ({ args, query }) => {
            const farmId = getPrismaFarmId();
            if (!farmId) {
              if (args.data?.farmId) return query(args);
              throw new UnauthorizedException('Missing farm context');
            }
            (args as any).data = { ...(args.data ?? {}), farmId };
            return query(args);
          },
          update: ({ args, query }) => {
            const farmId = getPrismaFarmId();
            if (!farmId) {
              if (args.where?.farmId) return query(args);
              throw new UnauthorizedException('Missing farm context');
            }
            args.where = { ...(args.where ?? {}), farmId };
            (args as any).data = { ...(args.data ?? {}), farmId };
            return query(args);
          },
          delete: ({ args, query }) => {
            const farmId = getPrismaFarmId();
            if (!farmId) {
              if (args.where?.farmId) return query(args);
              throw new UnauthorizedException('Missing farm context');
            }
            args.where = { ...(args.where ?? {}), farmId };
            return query(args);
          },
          updateMany: ({ args, query }) => {
            const farmId = getPrismaFarmId();
            if (!farmId) {
              if (args.where?.farmId) return query(args);
              throw new UnauthorizedException('Missing farm context');
            }
            args.where = { ...(args.where ?? {}), farmId };
            (args as any).data = { ...(args.data ?? {}), farmId };
            return query(args);
          },
          deleteMany: ({ args, query }) => {
            const farmId = getPrismaFarmId();
            if (!farmId) {
              if (args.where?.farmId) return query(args);
              throw new UnauthorizedException('Missing farm context');
            }
            args.where = { ...(args.where ?? {}), farmId };
            return query(args);
          },
          upsert: ({ args, query }) => {
            const farmId = getPrismaFarmId();
            if (!farmId) {
              if (args.where?.farmId) return query(args);
              throw new UnauthorizedException('Missing farm context');
            }
            args.where = { ...(args.where ?? {}), farmId };
            (args as any).create = { ...(args.create ?? {}), farmId };
            (args as any).update = { ...(args.update ?? {}), farmId };
            return query(args);
          },
        },
        waterSource: {
          findMany: ({ args, query }) => {
            const farmId = getPrismaFarmId();
            if (!farmId) throw new UnauthorizedException('Missing farm context');
            args.where = { ...(args.where ?? {}), farmId };
            return query(args);
          },
          findFirst: ({ args, query }) => {
            const farmId = getPrismaFarmId();
            if (!farmId) throw new UnauthorizedException('Missing farm context');
            args.where = { ...(args.where ?? {}), farmId };
            return query(args);
          },
          findUnique: ({ args, query }) => {
            const farmId = getPrismaFarmId();
            if (!farmId) throw new UnauthorizedException('Missing farm context');
            args.where = { ...(args.where ?? {}), farmId };
            return query(args);
          },
          count: ({ args, query }) => {
            const farmId = getPrismaFarmId();
            if (!farmId) throw new UnauthorizedException('Missing farm context');
            args.where = { ...(args.where ?? {}), farmId };
            return query(args);
          },
          aggregate: ({ args, query }) => {
            const farmId = getPrismaFarmId();
            if (!farmId) throw new UnauthorizedException('Missing farm context');
            args.where = { ...(args.where ?? {}), farmId };
            return query(args);
          },
          create: ({ args, query }) => {
            const farmId = getPrismaFarmId();
            if (!farmId) {
              if (args.data?.farmId) return query(args);
              throw new UnauthorizedException('Missing farm context');
            }
            (args as any).data = { ...(args.data ?? {}), farmId };
            return query(args);
          },
          update: ({ args, query }) => {
            const farmId = getPrismaFarmId();
            if (!farmId) {
              if (args.where?.farmId) return query(args);
              throw new UnauthorizedException('Missing farm context');
            }
            args.where = { ...(args.where ?? {}), farmId };
            (args as any).data = { ...(args.data ?? {}), farmId };
            return query(args);
          },
          delete: ({ args, query }) => {
            const farmId = getPrismaFarmId();
            if (!farmId) {
              if (args.where?.farmId) return query(args);
              throw new UnauthorizedException('Missing farm context');
            }
            args.where = { ...(args.where ?? {}), farmId };
            return query(args);
          },
          updateMany: ({ args, query }) => {
            const farmId = getPrismaFarmId();
            if (!farmId) {
              if (args.where?.farmId) return query(args);
              throw new UnauthorizedException('Missing farm context');
            }
            args.where = { ...(args.where ?? {}), farmId };
            (args as any).data = { ...(args.data ?? {}), farmId };
            return query(args);
          },
          deleteMany: ({ args, query }) => {
            const farmId = getPrismaFarmId();
            if (!farmId) {
              if (args.where?.farmId) return query(args);
              throw new UnauthorizedException('Missing farm context');
            }
            args.where = { ...(args.where ?? {}), farmId };
            return query(args);
          },
          upsert: ({ args, query }) => {
            const farmId = getPrismaFarmId();
            if (!farmId) {
              if (args.where?.farmId) return query(args);
              throw new UnauthorizedException('Missing farm context');
            }
            args.where = { ...(args.where ?? {}), farmId };
            (args as any).create = { ...(args.create ?? {}), farmId };
            (args as any).update = { ...(args.update ?? {}), farmId };
            return query(args);
          },
        },
        workflow: {
          findMany: ({ args, query }) => {
            const farmId = getPrismaFarmId();
            const baseWhere = args.where ?? {};
            if (!farmId) throw new UnauthorizedException('Missing farm context');
            args.where = { AND: [baseWhere, { farmId }] };
            return query(args);
          },
          findFirst: ({ args, query }) => {
            const farmId = getPrismaFarmId();
            const baseWhere = args.where ?? {};
            if (!farmId) throw new UnauthorizedException('Missing farm context');
            args.where = { AND: [baseWhere, { farmId }] };
            return query(args);
          },
          findUnique: ({ args, query }) => {
            const farmId = getPrismaFarmId();
            if (!farmId) throw new UnauthorizedException('Missing farm context');
            args.where = { ...(args.where ?? {}), farmId };
            return query(args);
          },
          count: ({ args, query }) => {
            const farmId = getPrismaFarmId();
            const baseWhere = args.where ?? {};
            if (!farmId) throw new UnauthorizedException('Missing farm context');
            args.where = { AND: [baseWhere, { farmId }] };
            return query(args);
          },
          aggregate: ({ args, query }) => {
            const farmId = getPrismaFarmId();
            const baseWhere = args.where ?? {};
            if (!farmId) throw new UnauthorizedException('Missing farm context');
            args.where = { AND: [baseWhere, { farmId }] };
            return query(args);
          },
          create: ({ args, query }) => {
            const farmId = getPrismaFarmId();
            if (!farmId) {
              throw new UnauthorizedException('Missing farm context');
            }
            (args as any).data = { ...(args.data ?? {}), farmId };
            return query(args);
          },
          update: ({ args, query }) => {
            const farmId = getPrismaFarmId();
            if (!farmId) throw new UnauthorizedException('Missing farm context');
            args.where = { ...(args.where ?? {}), farmId };
            (args as any).data = { ...(args.data ?? {}), farmId };
            return query(args);
          },
          delete: ({ args, query }) => {
            const farmId = getPrismaFarmId();
            if (!farmId) throw new UnauthorizedException('Missing farm context');
            args.where = { ...(args.where ?? {}), farmId };
            return query(args);
          },
          updateMany: ({ args, query }) => {
            const farmId = getPrismaFarmId();
            if (!farmId) throw new UnauthorizedException('Missing farm context');
            args.where = { ...(args.where ?? {}), farmId };
            (args as any).data = { ...(args.data ?? {}), farmId };
            return query(args);
          },
          deleteMany: ({ args, query }) => {
            const farmId = getPrismaFarmId();
            if (!farmId) throw new UnauthorizedException('Missing farm context');
            args.where = { ...(args.where ?? {}), farmId };
            return query(args);
          },
          upsert: ({ args, query }) => {
            const farmId = getPrismaFarmId();
            if (!farmId) throw new UnauthorizedException('Missing farm context');
            args.where = { ...(args.where ?? {}), farmId };
            (args as any).create = { ...(args.create ?? {}), farmId };
            (args as any).update = { ...(args.update ?? {}), farmId };
            return query(args);
          },
        },
      },
    });

    // Sobrescribimos delegados para que la app use el cliente extendido.
    (this as any).crop = (this.farmScopedPrisma as any).crop;
    (this as any).facility = (this.farmScopedPrisma as any).facility;
    (this as any).waterSource = (this.farmScopedPrisma as any).waterSource;
    (this as any).workflow = (this.farmScopedPrisma as any).workflow;
  }

  async onModuleInit() {
    // Conectamos la instancia base y la extendida (por seguridad).
    await this.$connect();
    await (this.farmScopedPrisma as any).$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
    await (this.farmScopedPrisma as any).$disconnect();
  }
}
