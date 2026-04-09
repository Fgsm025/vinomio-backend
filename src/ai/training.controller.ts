import {
  BadRequestException,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { CurrentUserPayload } from '../auth/decorators/current-user.decorator';
import { PrismaService } from '../prisma/prisma.service';
import { IngestionService } from './ingestion.service';

const MAX_TRAINING_DOCUMENTS = 10;
const MAX_PDF_BYTES = 3 * 1024 * 1024;

@Controller('training')
@UseGuards(JwtAuthGuard)
export class TrainingController {
  constructor(
    private readonly ingestionService: IngestionService,
    private readonly prisma: PrismaService,
  ) {}

  private assertOwnerWithFarm(user: CurrentUserPayload) {
    if (!user.farmId) {
      throw new ForbiddenException('Farm context required');
    }
    if (user.role !== 'OWNER') {
      throw new ForbiddenException('Only farm owners can manage training documents');
    }
  }

  @Get('documents')
  async listDocuments(@CurrentUser() user: CurrentUserPayload) {
    this.assertOwnerWithFarm(user);

    const grouped = await this.prisma.documentChunk.groupBy({
      by: ['source'],
      where: { ownerId: user.userId, source: { not: null } },
      _count: { _all: true },
    });

    const documents = grouped
      .filter((g) => g.source)
      .map((g) => ({
        source: g.source as string,
        chunkCount: g._count._all,
      }))
      .sort((a, b) => a.source.localeCompare(b.source, undefined, { sensitivity: 'base' }));

    return { documents };
  }

  @Delete('documents')
  async deleteDocument(
    @CurrentUser() user: CurrentUserPayload,
    @Query('source') source: string | undefined,
  ) {
    this.assertOwnerWithFarm(user);
    const trimmed = source?.trim();
    if (!trimmed) {
      throw new BadRequestException('Query parameter "source" is required');
    }

    return this.prisma.$transaction(async (tx) => {
      const deleted = await tx.documentChunk.deleteMany({
        where: { ownerId: user.userId, source: trimmed },
      });

      const synced = await tx.documentChunk.groupBy({
        by: ['source'],
        where: { ownerId: user.userId },
      });

      await tx.user.update({
        where: { id: user.userId },
        data: { documentCount: synced.length },
      });

      return {
        deletedChunks: deleted.count,
        documentCount: synced.length,
      };
    });
  }

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: MAX_PDF_BYTES },
    }),
  )
  async upload(
    @CurrentUser() user: CurrentUserPayload,
    @UploadedFile() file?: { buffer: Buffer; originalname: string; mimetype?: string },
  ) {
    this.assertOwnerWithFarm(user);
    if (!file?.buffer?.length) {
      throw new BadRequestException('PDF file required (field "file")');
    }
    const mime = file.mimetype?.toLowerCase() ?? '';
    if (mime !== 'application/pdf' && !mime.endsWith('/pdf')) {
      throw new BadRequestException('Only PDF files are allowed');
    }

    const originalName = file.originalname?.trim() || 'document.pdf';

    const existingSources = await this.prisma.documentChunk.groupBy({
      by: ['source'],
      where: { ownerId: user.userId },
    });
    if (existingSources.length >= MAX_TRAINING_DOCUMENTS) {
      throw new BadRequestException(
        `Maximum of ${MAX_TRAINING_DOCUMENTS} training documents reached`,
      );
    }

    const farm = await this.prisma.farm.findUnique({
      where: { id: user.farmId },
      select: { country: true },
    });

    // Embeddings run outside DB transactions; chunk INSERTs are atomic inside processPdf.
    const result = await this.ingestionService.processPdf(
      file.buffer,
      originalName,
      {
        ownerId: user.userId,
        country: farm?.country ?? undefined,
      },
    );

    return this.prisma.$transaction(async (tx) => {
      const synced = await tx.documentChunk.groupBy({
        by: ['source'],
        where: { ownerId: user.userId },
      });

      await tx.user.update({
        where: { id: user.userId },
        data: { documentCount: synced.length },
      });

      return {
        ...result,
        documentCount: synced.length,
      };
    });
  }
}
