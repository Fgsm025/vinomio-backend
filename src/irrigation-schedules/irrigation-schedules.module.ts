import { Module } from '@nestjs/common';
import { IrrigationSchedulesController } from './irrigation-schedules.controller';
import { IrrigationSchedulesService } from './irrigation-schedules.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [IrrigationSchedulesController],
  providers: [IrrigationSchedulesService],
})
export class IrrigationSchedulesModule {}
