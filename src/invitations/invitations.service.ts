import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInvitationDto } from './dto/create-invitation.dto';
import { AcceptInvitationDto } from './dto/accept-invitation.dto';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class InvitationsService {
  constructor(private readonly prisma: PrismaService) {}

  async createInvitation(
    createInvitationDto: CreateInvitationDto,
    farmId: string,
    invitedById: string,
  ) {
    const farm = await this.prisma.farm.findUnique({
      where: { id: farmId },
    });

    if (!farm) {
      throw new NotFoundException('Farm not found');
    }

    const existingUser = await this.prisma.user.findUnique({
      where: { email: createInvitationDto.email },
      include: {
        farms: {
          where: { farmId },
        },
      },
    });

    if (existingUser) {
      const alreadyMember = existingUser.farms.length > 0;
      if (alreadyMember) {
        throw new BadRequestException('User is already a member of this farm');
      }
    }

    const existingInvitation = await this.prisma.invitation.findFirst({
      where: {
        email: createInvitationDto.email,
        farmId,
        status: 'pending',
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    if (existingInvitation) {
      throw new BadRequestException('An active invitation already exists for this email');
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    return this.prisma.invitation.create({
      data: {
        email: createInvitationDto.email,
        farmId,
        role: createInvitationDto.role,
        invitedById,
        token,
        expiresAt,
      },
    });
  }

  async verifyInvitation(token: string) {
    const invitation = await this.prisma.invitation.findUnique({
      where: { token },
      include: {
        farm: {
          select: { id: true, name: true, slug: true },
        },
      },
    });

    if (!invitation) {
      throw new NotFoundException('Invalid invitation token');
    }

    return {
      email: invitation.email,
      role: invitation.role,
      farmName: invitation.farm.name,
      farmSlug: invitation.farm.slug,
      status: invitation.status,
      expired: invitation.expiresAt < new Date(),
    };
  }

  async acceptInvitation(acceptInvitationDto: AcceptInvitationDto) {
    const invitation = await this.prisma.invitation.findUnique({
      where: { token: acceptInvitationDto.token },
      include: {
        farm: true,
      },
    });

    if (!invitation) {
      throw new NotFoundException('Invalid invitation token');
    }

    if (invitation.status !== 'pending') {
      throw new BadRequestException('Invitation has already been used');
    }

    if (invitation.expiresAt < new Date()) {
      throw new BadRequestException('Invitation has expired');
    }

    let user = await this.prisma.user.findUnique({
      where: { email: invitation.email },
    });

    if (!user) {
      const hashedPassword = await bcrypt.hash(acceptInvitationDto.password, 10);
      user = await this.prisma.user.create({
        data: {
          email: invitation.email,
          password: hashedPassword,
          name: acceptInvitationDto.name,
          hasCompletedOnboarding: true,
        },
      });
    } else {
      if (!user.hasCompletedOnboarding) {
        await this.prisma.user.update({
          where: { id: user.id },
          data: { hasCompletedOnboarding: true },
        });
      }
    }

    const existingMembership = await this.prisma.userFarm.findUnique({
      where: { userId_farmId: { userId: user.id, farmId: invitation.farmId } },
    });

    if (!existingMembership) {
      await this.prisma.userFarm.create({
        data: {
          userId: user.id,
          farmId: invitation.farmId,
          role: invitation.role,
        },
      });
    }

    await this.prisma.invitation.update({
      where: { id: invitation.id },
      data: {
        status: 'accepted',
        acceptedAt: new Date(),
      },
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        hasCompletedOnboarding: true,
      },
      farm: {
        id: invitation.farm.id,
        name: invitation.farm.name,
        slug: invitation.farm.slug,
      },
      role: invitation.role,
    };
  }

  async getInvitations(farmId: string) {
    return this.prisma.invitation.findMany({
      where: { farmId },
      include: {
        invitedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async cancelInvitation(invitationId: string, farmId: string) {
    const invitation = await this.prisma.invitation.findFirst({
      where: {
        id: invitationId,
        farmId,
        status: 'pending',
      },
    });

    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }

    return this.prisma.invitation.update({
      where: { id: invitationId },
      data: {
        status: 'cancelled',
      },
    });
  }
}
