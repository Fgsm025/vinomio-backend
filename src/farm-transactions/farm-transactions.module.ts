import { Module } from '@nestjs/common';
import { FarmTransactionsService } from './farm-transactions.service';
import { FarmTransactionsController } from './farm-transactions.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [FarmTransactionsController],
  providers: [FarmTransactionsService],
  exports: [FarmTransactionsService],
})
export class FarmTransactionsModule {}
