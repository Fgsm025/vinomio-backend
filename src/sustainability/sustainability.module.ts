import { Module } from '@nestjs/common';
import { CropCyclesModule } from '../crop-cycles/crop-cycles.module';
import { SustainabilityController } from './sustainability.controller';
import { SustainabilityService } from './sustainability.service';

@Module({
  imports: [CropCyclesModule],
  controllers: [SustainabilityController],
  providers: [SustainabilityService],
  exports: [SustainabilityService],
})
export class SustainabilityModule {}
