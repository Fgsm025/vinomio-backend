import { Module } from '@nestjs/common';
import { RainfallEventsController } from './rainfall-events.controller';
import { RainfallEventsService } from './rainfall-events.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [RainfallEventsController],
  providers: [RainfallEventsService],
})
export class RainfallEventsModule {}
