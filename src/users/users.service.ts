import { Injectable, ConflictException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

const profileSelect = {
  id: true,
  email: true,
  name: true,
  firstName: true,
  lastName: true,
  userName: true,
  birthDate: true,
  phoneNumber: true,
  secondaryEmail: true,
  avatar: true,
  hasCompletedOnboarding: true,
  planStatus: true,
  lsSubscriptionId: true,
  endsAt: true,
  documentCount: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.UserSelect;

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  /** Prefer explicit OAuth given/family; else split display name; else nulls. */
  private resolveNameParts(
    displayName?: string,
    explicitFirst?: string,
    explicitLast?: string,
  ): { firstName: string | null; lastName: string | null } {
    if (explicitFirst !== undefined || explicitLast !== undefined) {
      return {
        firstName: explicitFirst?.trim() ? explicitFirst.trim() : null,
        lastName: explicitLast?.trim() ? explicitLast.trim() : null,
      };
    }
    if (displayName?.trim()) {
      const parts = displayName.trim().split(/\s+/);
      return {
        firstName: parts[0] ?? null,
        lastName: parts.length > 1 ? parts.slice(1).join(' ') : null,
      };
    }
    return { firstName: null, lastName: null };
  }

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
      select: profileSelect,
    });
  }

  async ensureDefaultSettings(userId: string) {
    await this.prisma.settings.upsert({
      where: { userId },
      create: { userId },
      update: {},
    });
  }

  async getSettings(userId: string) {
    await this.ensureDefaultSettings(userId);
    return this.prisma.settings.findUniqueOrThrow({
      where: { userId },
    });
  }

  async updateSettings(
    userId: string,
    data: {
      region?: string;
      temperatureUnit?: string;
      measurementSystem?: string;
      firstDayOfWeek?: number;
      dateFormat?: string;
      numberFormat?: string;
      listSortOrder?: string;
      language?: string;
      weatherAlerts?: boolean;
      taskUpdates?: boolean;
      systemAnnouncements?: boolean;
      fcmToken?: string;
      emailNotificationsEnabled?: boolean;
      fontSizeAdjustment?: number;
      colorFilter?: string;
      colorFilterEnabled?: boolean;
      use24HourTime?: boolean;
      showSeconds?: boolean;
    },
  ) {
    await this.ensureDefaultSettings(userId);
    const update: Prisma.SettingsUpdateInput = {};
    if (data.region !== undefined) update.region = data.region;
    if (data.temperatureUnit !== undefined)
      update.temperatureUnit = data.temperatureUnit;
    if (data.measurementSystem !== undefined)
      update.measurementSystem = data.measurementSystem;
    if (data.firstDayOfWeek !== undefined)
      update.firstDayOfWeek = data.firstDayOfWeek;
    if (data.dateFormat !== undefined) update.dateFormat = data.dateFormat;
    if (data.numberFormat !== undefined)
      update.numberFormat = data.numberFormat;
    if (data.listSortOrder !== undefined)
      update.listSortOrder = data.listSortOrder;
    if (data.language !== undefined) update.language = data.language;
    if (data.weatherAlerts !== undefined)
      update.weatherAlerts = data.weatherAlerts;
    if (data.taskUpdates !== undefined) update.taskUpdates = data.taskUpdates;
    if (data.systemAnnouncements !== undefined)
      update.systemAnnouncements = data.systemAnnouncements;
    if (data.fcmToken !== undefined)
      update.fcmToken = data.fcmToken === '' ? null : data.fcmToken;
    if (data.emailNotificationsEnabled !== undefined)
      update.emailNotificationsEnabled = data.emailNotificationsEnabled;
    if (data.fontSizeAdjustment !== undefined)
      update.fontSizeAdjustment = data.fontSizeAdjustment;
    if (data.colorFilter !== undefined) update.colorFilter = data.colorFilter;
    if (data.colorFilterEnabled !== undefined)
      update.colorFilterEnabled = data.colorFilterEnabled;
    if (data.use24HourTime !== undefined)
      update.use24HourTime = data.use24HourTime;
    if (data.showSeconds !== undefined) update.showSeconds = data.showSeconds;

    return this.prisma.settings.update({
      where: { userId },
      data: update,
    });
  }

  async create(email: string, password: string, name?: string) {
    const existingUser = await this.findByEmail(email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const { firstName, lastName } = this.resolveNameParts(
      name,
      undefined,
      undefined,
    );

    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        firstName,
        lastName,
        hasCompletedOnboarding: false,
      },
      select: profileSelect,
    });

    await this.ensureDefaultSettings(user.id);

    return user;
  }

  async upsertFromFirebase(
    email: string,
    name?: string,
    avatar?: string,
    googleId?: string,
    firstName?: string,
    lastName?: string,
  ) {
    const randomPassword = await bcrypt.hash(
      Math.random().toString(36) + Date.now().toString(36),
      10,
    );

    const updateData: {
      name?: string;
      avatar?: string;
      googleId?: string;
    } = {};
    if (name !== undefined) updateData.name = name;
    if (avatar !== undefined) updateData.avatar = avatar;
    if (googleId !== undefined) updateData.googleId = googleId;

    const { firstName: fn, lastName: ln } = this.resolveNameParts(
      name,
      firstName,
      lastName,
    );

    const includeFarms = {
      farms: {
        include: {
          farm: true,
        },
      },
    };

    try {
      let user = await this.prisma.user.upsert({
        where: { email },
        update: updateData,
        create: {
          email,
          password: randomPassword,
          name,
          avatar,
          googleId,
          firstName: fn,
          lastName: ln,
          hasCompletedOnboarding: false,
        },
        include: includeFarms,
      });

      const fillFirst =
        firstName !== undefined &&
        firstName.trim().length > 0 &&
        !user.firstName;
      const fillLast =
        lastName !== undefined && lastName.trim().length > 0 && !user.lastName;
      if (fillFirst || fillLast) {
        user = await this.prisma.user.update({
          where: { id: user.id },
          data: {
            ...(fillFirst ? { firstName: firstName!.trim() } : {}),
            ...(fillLast ? { lastName: lastName!.trim() } : {}),
          },
          include: includeFarms,
        });
      }

      await this.ensureDefaultSettings(user.id);
      return user;
    } catch (error) {
      const isEmailConflict =
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002' &&
        (() => {
          const target = error.meta?.target as string[] | undefined;
          const fields = (error.meta as any)?.driverAdapterError?.cause
            ?.constraint?.fields as string[] | undefined;
          return (
            (Array.isArray(target) && target.includes('email')) ||
            (Array.isArray(fields) && fields.includes('email'))
          );
        })();
      if (isEmailConflict) {
        const existing = await this.prisma.user.findUnique({
          where: { email },
          include: includeFarms,
        });
        if (!existing) throw error;
        let updated = await this.prisma.user.update({
          where: { email },
          data: updateData,
          include: includeFarms,
        });
        const fillFirst =
          firstName !== undefined &&
          firstName.trim().length > 0 &&
          !updated.firstName;
        const fillLast =
          lastName !== undefined &&
          lastName.trim().length > 0 &&
          !updated.lastName;
        if (fillFirst || fillLast) {
          updated = await this.prisma.user.update({
            where: { email },
            data: {
              ...(fillFirst ? { firstName: firstName!.trim() } : {}),
              ...(fillLast ? { lastName: lastName!.trim() } : {}),
            },
            include: includeFarms,
          });
        }
        await this.ensureDefaultSettings(updated.id);
        return updated;
      }
      throw error;
    }
  }

  async createFromFirebase(email: string, name?: string, avatar?: string) {
    return this.upsertFromFirebase(email, name, avatar);
  }

  async updateProfile(
    userId: string,
    dto: {
      firstName?: string;
      lastName?: string;
      userName?: string;
      birthDate?: string;
      phoneNumber?: string;
      secondaryEmail?: string;
    },
  ) {
    const data: Prisma.UserUpdateInput = {};

    if (dto.firstName !== undefined) {
      data.firstName =
        dto.firstName.trim() === '' ? null : dto.firstName.trim();
    }
    if (dto.lastName !== undefined) {
      data.lastName = dto.lastName.trim() === '' ? null : dto.lastName.trim();
    }
    if (dto.userName !== undefined) {
      data.userName = dto.userName.trim() === '' ? null : dto.userName.trim();
    }
    if (dto.phoneNumber !== undefined) {
      data.phoneNumber =
        dto.phoneNumber.trim() === '' ? null : dto.phoneNumber.trim();
    }
    if (dto.secondaryEmail !== undefined) {
      data.secondaryEmail =
        dto.secondaryEmail.trim() === '' ? null : dto.secondaryEmail.trim();
    }
    if (dto.birthDate !== undefined) {
      const raw = dto.birthDate.trim();
      data.birthDate = raw === '' ? null : new Date(`${raw}T12:00:00.000Z`);
    }

    return this.prisma.user.update({
      where: { id: userId },
      data,
      select: profileSelect,
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
      select: profileSelect,
    });
  }

  /** Grants Pro without Lemon Squeezy (promo / internal coupon). */
  async grantProFromCoupon(userId: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        planStatus: 'active',
        endsAt: null,
      },
      select: profileSelect,
    });
  }

  async updateAvatar(userId: string, avatar: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        avatar,
      },
      select: profileSelect,
    });
  }

  async delete(userId: string) {
    return this.prisma.user.delete({
      where: { id: userId },
    });
  }

  async activatePro(email: string) {
    return this.findUserForSubscription(email);
  }

  async deactivatePro(email: string) {
    const user = await this.findUserForSubscription(email);
    if (!user) return null;

    // Keep hook for future subscription-state persistence.
    return user;
  }

  private async findUserForSubscription(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findAll() {
    return this.prisma.user.findMany({
      select: profileSelect,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}
