import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  private profilePayload(user: {
    id: string;
    email: string;
    name: string | null;
    firstName: string | null;
    lastName: string | null;
    userName: string | null;
    birthDate: Date | null;
    phoneNumber: string | null;
    secondaryEmail: string | null;
    avatar: string | null;
    hasCompletedOnboarding: boolean;
    planStatus?: string;
    lsSubscriptionId?: string | null;
    endsAt?: Date | null;
  }) {
    const bd = user.birthDate;
    const rawEndsAt = user.endsAt ? new Date(user.endsAt) : null;
    const now = new Date();
    const planStatus = user.planStatus ?? 'free';
    const subscriptionSource = user.lsSubscriptionId ? 'lemonsqueezy' : 'none';
    let isPro = false;
    let trialDaysLeft = 0;

    if (planStatus === 'active' || planStatus === 'on_trial') {
      const hasTime = !rawEndsAt || rawEndsAt > now;
      if (hasTime) {
        isPro = true;
        if (planStatus === 'on_trial' && rawEndsAt) {
          const diffMs = rawEndsAt.getTime() - now.getTime();
          if (diffMs > 0) {
            trialDaysLeft = Math.ceil(diffMs / 86_400_000);
          }
        }
      }
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name ?? null,
      firstName: user.firstName ?? null,
      lastName: user.lastName ?? null,
      userName: user.userName ?? null,
      birthDate: bd
        ? (bd instanceof Date ? bd : new Date(bd)).toISOString().slice(0, 10)
        : null,
      phoneNumber: user.phoneNumber ?? null,
      secondaryEmail: user.secondaryEmail ?? null,
      avatar: user.avatar ?? null,
      hasCompletedOnboarding: user.hasCompletedOnboarding,
      planStatus,
      lsSubscriptionId: user.lsSubscriptionId ?? null,
      endsAt: rawEndsAt ? rawEndsAt.toISOString() : null,
      isPro,
      trialDaysLeft,
      subscriptionSource,
    };
  }

  async register(registerDto: RegisterDto) {
    const user = await this.usersService.create(
      registerDto.email,
      registerDto.password,
      registerDto.name,
    );

    const payload = {
      email: user.email,
      sub: user.id,
      needsOnboarding: true,
    };
    const access_token = this.jwtService.sign(payload);

    return {
      access_token,
      user: this.profilePayload(user),
      needsOnboarding: true,
    };
  }

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (user && (await bcrypt.compare(password, user.password))) {
      const { password: _, ...result } = user;
      return result;
    }
    return null;
  }

  async completeOnboarding(userId: string) {
    const user = await this.usersService.completeOnboarding(userId);
    return this.profilePayload(user);
  }

  private settingsPayload(settings: {
    region: string;
    temperatureUnit: string;
    measurementSystem: string;
    firstDayOfWeek: number;
    dateFormat: string;
    numberFormat: string;
    listSortOrder: string;
    language: string;
    weatherAlerts: boolean;
    taskUpdates: boolean;
    systemAnnouncements: boolean;
    fcmToken: string | null;
    emailNotificationsEnabled: boolean;
    fontSizeAdjustment: number;
    colorFilter: string;
    colorFilterEnabled: boolean;
    use24HourTime: boolean;
    showSeconds: boolean;
  }) {
    return {
      region: settings.region,
      temperatureUnit: settings.temperatureUnit,
      measurementSystem: settings.measurementSystem,
      firstDayOfWeek: settings.firstDayOfWeek,
      dateFormat: settings.dateFormat,
      numberFormat: settings.numberFormat,
      listSortOrder: settings.listSortOrder,
      language: settings.language,
      weatherAlerts: settings.weatherAlerts,
      taskUpdates: settings.taskUpdates,
      systemAnnouncements: settings.systemAnnouncements,
      fcmToken: settings.fcmToken,
      emailNotificationsEnabled: settings.emailNotificationsEnabled,
      fontSizeAdjustment: settings.fontSizeAdjustment,
      colorFilter: settings.colorFilter,
      colorFilterEnabled: settings.colorFilterEnabled,
      use24HourTime: settings.use24HourTime,
      showSeconds: settings.showSeconds,
    };
  }

  async getProfile(userId: string) {
    const user = await this.usersService.findById(userId);
    if (!user) return null;
    const settings = await this.usersService.getSettings(userId);
    return {
      ...this.profilePayload(user),
      settings: this.settingsPayload(settings),
    };
  }

  async updateSettings(userId: string, dto: UpdateSettingsDto) {
    const updated = await this.usersService.updateSettings(userId, dto);
    return this.settingsPayload(updated);
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const user = await this.usersService.updateProfile(userId, dto);
    return this.profilePayload(user);
  }

  async firebaseLogin(
    email: string,
    name?: string,
    avatar?: string,
    googleId?: string,
    farmId?: string,
    firstName?: string,
    lastName?: string,
  ) {
    const user = await this.usersService.upsertFromFirebase(
      email,
      name,
      avatar,
      googleId,
      firstName,
      lastName,
    );

    const userForLogin = {
      id: user.id,
      email: user.email,
      name: user.name,
      firstName: user.firstName,
      lastName: user.lastName,
      userName: user.userName,
      birthDate: user.birthDate,
      phoneNumber: user.phoneNumber,
      secondaryEmail: user.secondaryEmail,
      avatar: user.avatar,
      hasCompletedOnboarding: user.hasCompletedOnboarding,
      planStatus: user.planStatus,
      lsSubscriptionId: user.lsSubscriptionId,
      endsAt: user.endsAt,
      farms: (user.farms || []).map((uf: any) => ({
        farmId: uf.farmId,
        role: uf.role,
        farm: uf.farm,
      })),
    };

    return this.login(userForLogin, farmId);
  }

  async registerFromFirebase(
    email: string,
    name?: string,
    avatar?: string,
    googleId?: string,
    firstName?: string,
    lastName?: string,
  ) {
    const user = await this.usersService.upsertFromFirebase(
      email,
      name,
      avatar,
      googleId,
      firstName,
      lastName,
    );

    const payload = {
      email: user.email,
      sub: user.id,
      needsOnboarding: true,
    };
    const access_token = this.jwtService.sign(payload);

    return {
      access_token,
      user: this.profilePayload(user),
      needsOnboarding: true,
    };
  }

  async updateAvatar(userId: string, avatar: string) {
    const user = await this.usersService.updateAvatar(userId, avatar);
    return this.profilePayload(user);
  }

  /**
   * Redeem a subscription promo code (see VINOMIO_PRO_COUPON_CODE; defaults to MESSI231 if unset).
   */
  async redeemSubscriptionCoupon(userId: string, rawCode: string) {
    const expected = (
      process.env.VINOMIO_PRO_COUPON_CODE ?? 'MESSI231'
    ).trim();
    const code = String(rawCode ?? '').trim();
    if (!expected || code !== expected) {
      throw new BadRequestException('Invalid coupon code');
    }

    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const planStatus = user.planStatus ?? 'free';
    const rawEndsAt = user.endsAt ? new Date(user.endsAt) : null;
    const now = new Date();
    const alreadyPro =
      (planStatus === 'active' || planStatus === 'on_trial') &&
      (!rawEndsAt || rawEndsAt > now);

    const updated = alreadyPro
      ? user
      : await this.usersService.grantProFromCoupon(userId);

    return this.getProfile(updated.id);
  }

  async deleteAccount(userId: string) {
    await this.usersService.delete(userId);
    return { message: 'Account deleted successfully' };
  }

  async login(user: any, farmId?: string) {
    const userFarms = user.farms || [];
    const base = this.profilePayload(user);

    if (!user.hasCompletedOnboarding) {
      const payload: any = {
        email: user.email,
        sub: user.id,
        needsOnboarding: true,
      };

      if (userFarms.length > 0) {
        let selectedFarm = userFarms[0];
        if (farmId) {
          const found = userFarms.find((uf: any) => uf.farmId === farmId);
          if (found) {
            selectedFarm = found;
          }
        }
        payload.farmId = selectedFarm.farmId;
        payload.role = selectedFarm.role;
      }

      const access_token = this.jwtService.sign(payload);

      return {
        access_token,
        user: {
          ...base,
          farmId:
            userFarms.length > 0 ? farmId || userFarms[0].farmId : undefined,
          role:
            userFarms.length > 0
              ? userFarms.find((uf: any) => uf.farmId === farmId)?.role ||
                userFarms[0].role
              : undefined,
          hasCompletedOnboarding: false,
          farms: userFarms.map((uf: any) => ({
            id: uf.farmId,
            name: uf.farm.name,
            role: uf.role,
          })),
        },
        needsOnboarding: true,
      };
    }

    if (userFarms.length === 0) {
      throw new Error('User has no farms assigned');
    }

    let selectedFarm = userFarms[0];
    if (farmId) {
      const found = userFarms.find((uf: any) => uf.farmId === farmId);
      if (found) {
        selectedFarm = found;
      }
    }

    const payload = {
      email: user.email,
      sub: user.id,
      farmId: selectedFarm.farmId,
      role: selectedFarm.role,
    };
    const access_token = this.jwtService.sign(payload);

    return {
      access_token,
      user: {
        ...base,
        farmId: selectedFarm.farmId,
        role: selectedFarm.role,
        hasCompletedOnboarding: user.hasCompletedOnboarding,
        farms: userFarms.map((uf: any) => ({
          id: uf.farmId,
          name: uf.farm.name,
          role: uf.role,
        })),
      },
      needsOnboarding: false,
    };
  }
}
