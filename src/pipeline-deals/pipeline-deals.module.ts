import { Module } from '@nestjs/common';
import { PipelineDealsController } from './pipeline-deals.controller';
import { PipelineDealsService } from './pipeline-deals.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [PipelineDealsController],
  providers: [PipelineDealsService],
})
export class PipelineDealsModule {}
