import { Body, Controller, Post } from '@nestjs/common';
import { ReportService } from './report.service';
import type { ReportQuery } from './report.service';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportService: ReportService) {}

  @Post('query')
  query(@Body() body: ReportQuery) {
    return this.reportService.query(body);
  }
}

