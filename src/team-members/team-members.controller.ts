import { Controller, Get, Post, Put, Delete, Body, Param, ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { TeamMembersService } from './team-members.service';
import { CreateTeamMemberDto } from './dto/create-team-member.dto';
import { UpdateTeamMemberDto } from './dto/update-team-member.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { CurrentUserPayload } from '../auth/decorators/current-user.decorator';
import { Role } from '../auth/decorators/roles.decorator';

@Controller('team-members')
export class TeamMembersController {
  constructor(private readonly teamMembersService: TeamMembersService) {}

  @Post()
  create(@Body() dto: CreateTeamMemberDto) {
    return this.teamMembersService.create(dto);
  }

  @Get('farm-members')
  @UseGuards(JwtAuthGuard)
  getFarmMembers(@CurrentUser() user: CurrentUserPayload) {
    if (!user.farmId) {
      throw new Error('Farm context required (x-farm-id header)');
    }
    return this.teamMembersService.findFarmMembers(user.farmId);
  }

  @Put('farm-members/:userId/access-level')
  @UseGuards(JwtAuthGuard)
  updateMemberAccessLevel(
    @CurrentUser() user: CurrentUserPayload,
    @Param('userId', ParseUUIDPipe) userId: string,
    @Body('role') role: Role,
  ) {
    if (!user.farmId) {
      throw new Error('Farm context required (x-farm-id header)');
    }
    return this.teamMembersService.updateMemberAccessLevel(user.userId, user.farmId, userId, role);
  }

  @Get()
  findAll() {
    return this.teamMembersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.teamMembersService.findOne(id);
  }

  @Put(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateTeamMemberDto) {
    return this.teamMembersService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.teamMembersService.remove(id);
  }
}
