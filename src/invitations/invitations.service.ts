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
    exploitationId: string,
    invitedById: string,
  ) {
    const exploitation = await this.prisma.exploitation.findUnique({
      where: { id: exploitationId },
    });

    if (!exploitation) {
      throw new NotFoundException('Exploitation not found');
    }

    const existingUser = await this.prisma.user.findUnique({
      where: { email: createInvitationDto.email },
      include: {
        exploitations: {
          where: { exploitationId },
        },
      },
    });

    if (existingUser) {
      const alreadyMember = existingUser.exploitations.length > 0;
      if (alreadyMember) {
        throw new BadRequestException('User is already a member of this exploitation');
      }
    }

    const existingInvitation = await this.prisma.invitation.findFirst({
      where: {
        email: createInvitationDto.email,
        exploitationId,
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
        exploitationId,
        role: createInvitationDto.role,
        invitedById,
        token,
        expiresAt,
      },
    });
  }

  async acceptInvitation(acceptInvitationDto: AcceptInvitationDto) {
    const invitation = await this.prisma.invitation.findUnique({
      where: { token: acceptInvitationDto.token },
      include: {
        exploitation: true,
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
          hasCompletedOnboarding: false,
        },
      });
    }

    await this.prisma.userExploitation.create({
      data: {
        userId: user.id,
        exploitationId: invitation.exploitationId,
        role: invitation.role,
      },
    });

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
        hasCompletedOnboarding: user.hasCompletedOnboarding,
      },
      exploitation: {
        id: invitation.exploitation.id,
        name: invitation.exploitation.name,
      },
      role: invitation.role,
    };
  }

  async getInvitations(exploitationId: string) {
    return this.prisma.invitation.findMany({
      where: { exploitationId },
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

  async cancelInvitation(invitationId: string, exploitationId: string) {
    const invitation = await this.prisma.invitation.findFirst({
      where: {
        id: invitationId,
        exploitationId,
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
