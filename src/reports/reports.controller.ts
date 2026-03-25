import { BadRequestException, Body, Controller, Delete, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { CurrentUserPayload } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ReportService } from './report.service';
import type { ReportQuery, ReportTemplateCreateInput } from './report.service';

@Controller('reports')
@UseGuards(JwtAuthGuard)
export class ReportsController {
  constructor(private readonly reportService: ReportService) {}

  @Post('query')
  query(@Body() body: ReportQuery, @CurrentUser() user: CurrentUserPayload) {
    const resolvedFarmId = user.farmId || body.farmId;
    if (!resolvedFarmId) {
      throw new BadRequestException('farmId is required');
    }
    return this.reportService.query({ ...body, farmId: resolvedFarmId });
  }

  @Get('templates')
  getTemplates(@CurrentUser() user: CurrentUserPayload, @Query('farmId') farmId: string) {
    const resolvedFarmId = user.farmId || farmId;
    if (!resolvedFarmId) {
      throw new BadRequestException('farmId is required');
    }
    return this.reportService.getTemplates(resolvedFarmId);
  }

  @Post('templates')
  createTemplate(@Body() body: ReportTemplateCreateInput, @CurrentUser() user: CurrentUserPayload) {
    const resolvedFarmId = user.farmId || body.farmId;
    if (!resolvedFarmId) {
      throw new BadRequestException('farmId is required');
    }
    return this.reportService.createTemplate({ ...body, farmId: resolvedFarmId });
  }

  @Delete('templates/:id')
  deleteTemplate(@Param('id') id: string) {
    return this.reportService.deleteTemplate(id);
  }
}

