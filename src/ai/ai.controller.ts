import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { CurrentUserPayload } from '../auth/decorators/current-user.decorator';
import { AiService } from './ai.service';
import { IngestionService } from './ingestion.service';
import { ChatDto } from './dto/chat.dto';

@Controller('ai')
@UseGuards(JwtAuthGuard)
export class AiController {
  constructor(
    private readonly aiService: AiService,
    private readonly ingestionService: IngestionService,
  ) {}

  @Post('chat')
  async chat(@Body() dto: ChatDto, @CurrentUser() user: CurrentUserPayload) {
    if (!user.farmId) {
      throw new ForbiddenException('No tienes acceso a esta finca');
    }
    if (dto.farmId !== user.farmId) {
      throw new ForbiddenException('No tienes acceso a esta finca');
    }

    const response = await this.aiService.getChatResponse(
      dto.userMessage,
      user.farmId,
      user.userId,
    );

    return { response };
  }

  @Post('ingest/pdf')
  @UseInterceptors(FileInterceptor('file'))
  async ingestPdf(
    @UploadedFile() file: { buffer: Buffer } | undefined,
    @Body('sourceName') sourceName: string | undefined,
    @Body('country') country?: string,
    @Body('category') category?: string,
  ) {
    if (!file?.buffer?.length) {
      throw new BadRequestException('Se requiere un archivo PDF en el campo "file"');
    }
    if (!sourceName?.trim()) {
      throw new BadRequestException('Se requiere "sourceName" (nombre o identificador del documento)');
    }

    return this.ingestionService.processPdf(file.buffer, sourceName.trim(), {
      country: country?.trim() || undefined,
      category: category?.trim() || undefined,
    });
  }
}
