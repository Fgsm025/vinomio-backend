import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Role } from '../auth/decorators/roles.decorator';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTeamMemberDto } from './dto/create-team-member.dto';
import { UpdateTeamMemberDto } from './dto/update-team-member.dto';

@Injectable()
export class TeamMembersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateTeamMemberDto) {
    return this.prisma.teamMember.create({ data: dto });
  }

  async findAll() {
    return this.prisma.teamMember.findMany({
      orderBy: { createdAt: 'desc' },
      include: { farm: true },
    });
  }

  /** Returns users with access to the farm (UserFarm), for personnel list. */
  async findFarmMembers(farmId: string) {
    const [userFarms, teamMembers] = await Promise.all([
      this.prisma.userFarm.findMany({
        where: { farmId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
            },
          },
        },
        orderBy: { createdAt: 'asc' },
      }),
      this.prisma.teamMember.findMany({
        where: { farmId },
        select: {
          id: true,
          name: true,
          email: true,
          role: true, // puesto en la finca (texto libre)
          startDate: true,
          status: true,
        },
      }),
    ]);

    return userFarms.map((uf) => {
      const rawName = uf.user.name?.trim();
      const isRealName = rawName && !rawName.includes('@');
      const displayName =
        isRealName ? rawName : (uf.user.email?.split('@')[0] || 'User').replace(/^\w/, (c) => c.toUpperCase());

      const matchingTeamMember = teamMembers.find((tm) => tm.email?.toLowerCase() === uf.user.email?.toLowerCase());

      return {
        id: uf.user.id,
        name: matchingTeamMember?.name || displayName,
        email: uf.user.email,
        avatar: uf.user.avatar,
        farmId,
        role: uf.role,
        farmRole: matchingTeamMember?.role || null,
        startDate: matchingTeamMember?.startDate ?? null,
        status: matchingTeamMember?.status || 'active',
      };
    });
  }

  /**
   * Securely update the SystemRole (UserFarm.role) for a user in a farm.
   * Only an OWNER of that same farm can promote/demote roles, and
   * only an OWNER can promote another user to OWNER.
   */
  async updateMemberAccessLevel(
    currentUserId: string,
    farmId: string,
    targetUserId: string,
    nextRole: Role,
  ) {
    const [currentMembership, targetMemberships] = await Promise.all([
      this.prisma.userFarm.findUnique({
        where: { userId_farmId: { userId: currentUserId, farmId } },
      }),
      this.prisma.userFarm.findMany({
        where: { farmId, userId: targetUserId },
      }),
    ]);

    if (!currentMembership || currentMembership.role !== Role.OWNER) {
      throw new ForbiddenException('Only farm owners can change member access levels');
    }

    const targetMembership = targetMemberships[0];
    if (!targetMembership) {
      throw new NotFoundException('Target member is not part of this farm');
    }

    // Only OWNER can promote another user to OWNER
    if (nextRole === Role.OWNER && currentMembership.userId !== targetUserId) {
      // current user is OWNER (checked above) and is promoting another user to OWNER – allowed
      // but you can add extra business rules here if needed
    }

    // Prevent demoting the last OWNER of the farm
    if (targetMembership.role === Role.OWNER && nextRole !== Role.OWNER) {
      const ownerCount = await this.prisma.userFarm.count({
        where: { farmId, role: Role.OWNER },
      });
      if (ownerCount <= 1) {
        throw new ForbiddenException('Cannot remove the last owner of the farm');
      }
    }

    return this.prisma.userFarm.update({
      where: { id: targetMembership.id },
      data: { role: nextRole },
    });
  }

  async findOne(id: string) {
    const member = await this.prisma.teamMember.findUnique({
      where: { id },
      include: { farm: true },
    });
    if (!member) {
      throw new NotFoundException(`TeamMember with id "${id}" not found`);
    }
    return member;
  }

  async update(id: string, dto: UpdateTeamMemberDto) {
    await this.findOne(id);
    return this.prisma.teamMember.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.teamMember.delete({ where: { id } });
  }
}
