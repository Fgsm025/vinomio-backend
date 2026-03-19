import { AsyncLocalStorage } from 'node:async_hooks';

export type PrismaFarmContext = {
  farmId: string | null;
};

const prismaFarmContext = new AsyncLocalStorage<PrismaFarmContext>();

export const runPrismaFarmContext = <T>(ctx: PrismaFarmContext, fn: () => T): T =>
  prismaFarmContext.run(ctx, fn);

export const getPrismaFarmId = (): string | null => prismaFarmContext.getStore()?.farmId ?? null;

