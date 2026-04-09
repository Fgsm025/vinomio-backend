import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { IngestionService } from './ingestion.service';
import { TrainingController } from './training.controller';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [AiController, TrainingController],
  providers: [AiService, IngestionService],
  exports: [AiService, IngestionService],
})
export class AiModule {}
