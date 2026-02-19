import { Injectable, ConflictException } from '@nestjs/common';
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

  async createFromFirebase(email: string, name?: string, avatar?: string) {
    const existingUser = await this.findByEmail(email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const randomPassword = await bcrypt.hash(Math.random().toString(36) + Date.now().toString(36), 10);

    return this.prisma.user.create({
      data: {
        email,
        password: randomPassword,
        name,
        avatar,
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
}
