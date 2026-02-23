import { Module } from '@nestjs/common';
import { WaterConsumptionController } from './water-consumption.controller';
import { WaterConsumptionService } from './water-consumption.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [WaterConsumptionController],
  providers: [WaterConsumptionService],
})
export class WaterConsumptionModule {}
