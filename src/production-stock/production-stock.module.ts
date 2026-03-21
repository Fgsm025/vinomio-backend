import { Module } from '@nestjs/common';
import { ProductionStockService } from './production-stock.service';
import { ProductionStockController } from './production-stock.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ProductionStockController],
  providers: [ProductionStockService],
  exports: [ProductionStockService],
})
export class ProductionStockModule {}
