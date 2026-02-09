import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { InvitationsService } from './invitations.service';
import { CreateInvitationDto } from './dto/create-invitation.dto';
import { AcceptInvitationDto } from './dto/accept-invitation.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles, Role } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { CurrentUserPayload } from '../auth/decorators/current-user.decorator';

@Controller('invitations')
export class InvitationsController {
  constructor(private readonly invitationsService: InvitationsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.OWNER, Role.ADMIN)
  create(
    @Body() createInvitationDto: CreateInvitationDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    if (!user.exploitationId) {
      throw new Error('User must have an exploitation assigned');
    }
    return this.invitationsService.createInvitation(
      createInvitationDto,
      user.exploitationId,
      user.userId,
    );
  }

  @Post('accept')
  accept(@Body() acceptInvitationDto: AcceptInvitationDto) {
    return this.invitationsService.acceptInvitation(acceptInvitationDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.OWNER, Role.ADMIN)
  findAll(@CurrentUser() user: CurrentUserPayload) {
    if (!user.exploitationId) {
      throw new Error('User must have an exploitation assigned');
    }
    return this.invitationsService.getInvitations(user.exploitationId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.OWNER, Role.ADMIN)
  cancel(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    if (!user.exploitationId) {
      throw new Error('User must have an exploitation assigned');
    }
    return this.invitationsService.cancelInvitation(id, user.exploitationId);
  }
}
