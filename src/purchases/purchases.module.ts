import { Module } from '@nestjs/common';
import { PurchasesService } from './purchases.service';
import { PurchasesController } from './purchases.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { FarmTransactionsModule } from '../farm-transactions/farm-transactions.module';

@Module({
  imports: [PrismaModule, FarmTransactionsModule],
  controllers: [PurchasesController],
  providers: [PurchasesService],
})
export class PurchasesModule {}
