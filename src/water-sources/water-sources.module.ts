import { Module } from '@nestjs/common';
import { WaterSourcesController } from './water-sources.controller';
import { WaterSourcesService } from './water-sources.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [WaterSourcesController],
  providers: [WaterSourcesService],
})
export class WaterSourcesModule {}
