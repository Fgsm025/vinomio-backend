import { Injectable, NotFoundException } from '@nestjs/common';
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
    const userFarms = await this.prisma.userFarm.findMany({
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
    });

    return userFarms.map((uf) => {
      const rawName = uf.user.name?.trim();
      const isRealName = rawName && !rawName.includes('@');
      const displayName =
        isRealName ? rawName : (uf.user.email?.split('@')[0] || 'User').replace(/^\w/, (c) => c.toUpperCase());

      return {
        id: uf.user.id,
        name: displayName,
        email: uf.user.email,
        avatar: uf.user.avatar,
        farmId,
        role: uf.role,
        startDate: null,
        status: 'active',
      };
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
