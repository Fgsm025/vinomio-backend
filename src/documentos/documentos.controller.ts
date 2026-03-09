import { Body, Controller, Get, Param, Post } from '@nestjs/common';
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
}