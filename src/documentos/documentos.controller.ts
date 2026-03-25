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
    const documents = await this.prisma.document.findMany({
      where: { farmId },
      orderBy: { createdAt: 'desc' },
    });
    const totalSize = documents.reduce((acc, doc) => acc + doc.size, 0);
    return { documents, totalSize };
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