import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { ReportService } from './report.service';
import { ReportsController } from './reports.controller';

@Module({
  imports: [PrismaModule],
  providers: [ReportService],
  controllers: [ReportsController],
  exports: [ReportService],
})
export class ReportsModule {}

