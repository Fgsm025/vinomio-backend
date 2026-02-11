import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { CampaignsService } from './campaigns.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { CurrentUserPayload } from '../auth/decorators/current-user.decorator';

@Controller('campaigns')
@UseGuards(JwtAuthGuard)
export class CampaignsController {
  constructor(private readonly campaignsService: CampaignsService) {}

  @Get()
  findAll(@CurrentUser() user: CurrentUserPayload) {
    return this.campaignsService.findAll(user.farmId);
  }

  @Get(':seasonId')
  findBySeason(
    @Param('seasonId') seasonId: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.campaignsService.findBySeason(seasonId, user.farmId);
  }
}
