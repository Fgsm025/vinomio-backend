import { Module } from '@nestjs/common';
import { CropCyclesController } from './crop-cycles.controller';
import { CropCyclesService } from './crop-cycles.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [CropCyclesController],
  providers: [CropCyclesService],
})
export class CropCyclesModule {}
