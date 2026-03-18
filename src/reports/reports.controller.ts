import { Body, Controller, Delete, Get, Param, Post, Query } from '@nestjs/common';
import { ReportService } from './report.service';
import type { ReportQuery, ReportTemplateCreateInput } from './report.service';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportService: ReportService) {}

  @Post('query')
  query(@Body() body: ReportQuery) {
    return this.reportService.query(body);
  }

  @Get('templates')
  getTemplates(@Query('farmId') farmId: string) {
    return this.reportService.getTemplates(farmId);
  }

  @Post('templates')
  createTemplate(@Body() body: ReportTemplateCreateInput) {
    return this.reportService.createTemplate(body);
  }

  @Delete('templates/:id')
  deleteTemplate(@Param('id') id: string) {
    return this.reportService.deleteTemplate(id);
  }
}

