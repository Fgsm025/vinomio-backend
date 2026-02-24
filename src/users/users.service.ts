import { Injectable, ConflictException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      include: {
        farms: {
          include: {
            farm: true,
          },
        },
      },
    });
  }

  async findById(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        hasCompletedOnboarding: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async create(email: string, password: string, name?: string) {
    const existingUser = await this.findByEmail(email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    return this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        hasCompletedOnboarding: false,
      },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        hasCompletedOnboarding: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async upsertFromFirebase(email: string, name?: string, avatar?: string, googleId?: string) {
    const randomPassword = await bcrypt.hash(Math.random().toString(36) + Date.now().toString(36), 10);

    const updateData: {
      name?: string;
      avatar?: string;
      googleId?: string;
    } = {};
    if (name !== undefined) updateData.name = name;
    if (avatar !== undefined) updateData.avatar = avatar;
    if (googleId !== undefined) updateData.googleId = googleId;

    const includeFarms = {
      farms: {
        include: {
          farm: true,
        },
      },
    };

    try {
      return await this.prisma.user.upsert({
        where: { email },
        update: updateData,
        create: {
          email,
          password: randomPassword,
          name,
          avatar,
          googleId,
          hasCompletedOnboarding: false,
        },
        include: includeFarms,
      });
    } catch (error) {
      const isEmailConflict =
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002' &&
        (() => {
          const target = error.meta?.target as string[] | undefined;
          const fields = (error.meta as any)?.driverAdapterError?.cause?.constraint?.fields as string[] | undefined;
          return (Array.isArray(target) && target.includes('email')) || (Array.isArray(fields) && fields.includes('email'));
        })();
      if (isEmailConflict) {
        const existing = await this.prisma.user.findUnique({
          where: { email },
          include: includeFarms,
        });
        if (!existing) throw error;
        return this.prisma.user.update({
          where: { email },
          data: updateData,
          include: includeFarms,
        });
      }
      throw error;
    }
  }

  async createFromFirebase(email: string, name?: string, avatar?: string) {
    return this.upsertFromFirebase(email, name, avatar);
  }

  async getUserFarms(userId: string) {
    return this.prisma.userFarm.findMany({
      where: { userId },
      include: {
        farm: true,
      },
    });
  }

  async completeOnboarding(userId: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        hasCompletedOnboarding: true,
      },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        hasCompletedOnboarding: true,
      },
    });
  }

  async updateAvatar(userId: string, avatar: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        avatar,
      },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        hasCompletedOnboarding: true,
      },
    });
  }

  async delete(userId: string) {
    return this.prisma.user.delete({
      where: { id: userId },
    });
  }

  async findAll() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        hasCompletedOnboarding: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}
