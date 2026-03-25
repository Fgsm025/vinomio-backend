import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { CurrentUserPayload } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('fincas')
@UseGuards(JwtAuthGuard)
export class DocumentosController {
  constructor(private readonly prisma: PrismaService) {}

  private resolveFarmId(user: CurrentUserPayload, fincaIdParam?: string): string {
    const tokenFarmId = user.farmId;
    const routeFarmId = fincaIdParam?.trim();

    if (!tokenFarmId && !routeFarmId) {
      throw new BadRequestException('farmId is required');
    }
    if (tokenFarmId && routeFarmId && tokenFarmId !== routeFarmId) {
      throw new ForbiddenException('Farm access denied');
    }
    return tokenFarmId || (routeFarmId as string);
  }

  @Post(':fincaId/documentos')
  async createDocument(
    @CurrentUser() user: CurrentUserPayload,
    @Param('fincaId') fincaId: string,
    @Body() body: { url: string; size: number; name: string; type?: string },
  ) {
    const farmId = this.resolveFarmId(user, fincaId);
    const document = await this.prisma.document.create({
      data: {
        farmId,
        url: body.url,
        name: body.name,
        size: body.size,
        type: body.type ?? '',
      },
    });

    return document;
  }

  @Get(':fincaId/documentos')
  async getDocuments(@CurrentUser() user: CurrentUserPayload, @Param('fincaId') fincaId: string) {
    const farmId = this.resolveFarmId(user, fincaId);

    // 1) Identificar el ownerId de esta finca
    const ownerMembership = await this.prisma.userFarm.findFirst({
      where: { farmId, role: 'OWNER' },
      select: { userId: true },
    });

    if (!ownerMembership?.userId) {
      throw new NotFoundException('Owner for this farm not found');
    }

    const ownerId = ownerMembership.userId;

    // 2) Obtener todas las fincas del owner (solo donde es OWNER)
    const ownerFarms = await this.prisma.userFarm.findMany({
      where: { userId: ownerId, role: 'OWNER' },
      select: { farmId: true },
    });
    const ownerFarmIds = ownerFarms.map((f) => f.farmId);

    // 3) Lista de documentos para la finca solicitada (no global)
    const documents = await this.prisma.document.findMany({
      where: { farmId },
      orderBy: { createdAt: 'desc' },
    });

    // 4) totalSize global para el owner (gran total) para que el cupo sea único
    const ownerFarmWhere =
      ownerFarmIds.length > 0 ? { farmId: { in: ownerFarmIds } } : { farmId };

    const totalAgg = await this.prisma.document.aggregate({
      where: ownerFarmWhere,
      _sum: { size: true },
    });
    const totalSize = totalAgg._sum.size ?? 0;

    // Breakdown global por tipo (Photos/Videos/Documents) basado en `type` del documento.
    const photosAgg = await this.prisma.document.aggregate({
      where: { ...ownerFarmWhere, type: { startsWith: 'image/' } },
      _sum: { size: true },
    });
    const photosCount = await this.prisma.document.count({
      where: { ...ownerFarmWhere, type: { startsWith: 'image/' } },
    });

    const videosAgg = await this.prisma.document.aggregate({
      where: { ...ownerFarmWhere, type: { startsWith: 'video/' } },
      _sum: { size: true },
    });
    const videosCount = await this.prisma.document.count({
      where: { ...ownerFarmWhere, type: { startsWith: 'video/' } },
    });

    // Docs = todo lo que NO sea image/* ni video/*
    const docsAgg = await this.prisma.document.aggregate({
      where: {
        ...ownerFarmWhere,
        AND: [
          { type: { not: { startsWith: 'image/' } } },
          { type: { not: { startsWith: 'video/' } } },
        ],
      },
      _sum: { size: true },
    });
    const docsCount = await this.prisma.document.count({
      where: {
        ...ownerFarmWhere,
        AND: [
          { type: { not: { startsWith: 'image/' } } },
          { type: { not: { startsWith: 'video/' } } },
        ],
      },
    });

    const totalPhotosSize = photosAgg._sum.size ?? 0;
    const totalVideosSize = videosAgg._sum.size ?? 0;
    // Preferimos mantener consistencia con `totalSize` (por cualquier clasificación eventual).
    const totalDocsSize = Math.max(0, totalSize - totalPhotosSize - totalVideosSize);

    return {
      documents,
      totalSize,
      totalPhotosSize,
      totalVideosSize,
      totalDocsSize,
      photosCount,
      videosCount,
      docsCount,
    };
  }

  @Patch(':fincaId/documentos/:id')
  async updateDocumentName(
    @CurrentUser() user: CurrentUserPayload,
    @Param('fincaId') fincaId: string,
    @Param('id') id: string,
    @Body() body: { name?: string },
  ) {
    const farmId = this.resolveFarmId(user, fincaId);
    if (!body.name || body.name.trim() === '') {
      throw new NotFoundException('Nombre de documento inválido');
    }

    const document = await this.prisma.document.updateMany({
      where: { id, farmId },
      data: { name: body.name.trim() },
    });

    if (document.count === 0) {
      throw new NotFoundException('Documento no encontrado');
    }

    return { success: true };
  }

  @Delete(':fincaId/documentos/:id')
  async deleteDocument(
    @CurrentUser() user: CurrentUserPayload,
    @Param('fincaId') fincaId: string,
    @Param('id') id: string,
  ) {
    const farmId = this.resolveFarmId(user, fincaId);
    const result = await this.prisma.document.deleteMany({
      where: { id, farmId },
    });

    if (result.count === 0) {
      throw new NotFoundException('Documento no encontrado');
    }

    return { success: true };
  }
}