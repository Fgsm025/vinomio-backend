import { Body, Controller, Delete, Get, NotFoundException, Param, Patch, Post } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller('fincas')
export class DocumentosController {
  constructor(private readonly prisma: PrismaService) {}

  @Post(':fincaId/documentos')
  async createDocument(
    @Param('fincaId') fincaId: string,
    @Body() body: { url: string; size: number; name: string; type?: string },
  ) {
    const document = await this.prisma.document.create({
      data: {
        farmId: fincaId,
        url: body.url,
        name: body.name,
        size: body.size,
        type: body.type ?? '',
      },
    });

    return document;
  }

  @Get(':fincaId/documentos')
  async getDocuments(@Param('fincaId') fincaId: string) {
    const documents = await this.prisma.document.findMany({
      where: { farmId: fincaId },
      orderBy: { createdAt: 'desc' },
    });
    const totalSize = documents.reduce((acc, doc) => acc + doc.size, 0);
    return { documents, totalSize };
  }

  @Patch(':fincaId/documentos/:id')
  async updateDocumentName(
    @Param('fincaId') fincaId: string,
    @Param('id') id: string,
    @Body() body: { name?: string },
  ) {
    if (!body.name || body.name.trim() === '') {
      throw new NotFoundException('Nombre de documento inválido');
    }

    const document = await this.prisma.document.updateMany({
      where: { id, farmId: fincaId },
      data: { name: body.name.trim() },
    });

    if (document.count === 0) {
      throw new NotFoundException('Documento no encontrado');
    }

    return { success: true };
  }

  @Delete(':fincaId/documentos/:id')
  async deleteDocument(@Param('fincaId') fincaId: string, @Param('id') id: string) {
    const result = await this.prisma.document.deleteMany({
      where: { id, farmId: fincaId },
    });

    if (result.count === 0) {
      throw new NotFoundException('Documento no encontrado');
    }

    return { success: true };
  }
}