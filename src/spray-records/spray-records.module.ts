import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { SprayRecordsController } from './spray-records.controller';
import { SprayRecordsService } from './spray-records.service';

@Module({
  imports: [PrismaModule],
  controllers: [SprayRecordsController],
  providers: [SprayRecordsService],
})
export class SprayRecordsModule {}
