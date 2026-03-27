import { Body, Controller, ForbiddenException, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { CurrentUserPayload } from '../auth/decorators/current-user.decorator';
import { AiService } from './ai.service';
import { ChatDto } from './dto/chat.dto';

@Controller('ai')
@UseGuards(JwtAuthGuard)
export class AiController {
  constructor(private readonly aiService: AiService) {}

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
    );

    return { response };
  }
}
