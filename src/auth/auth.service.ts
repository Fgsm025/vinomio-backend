import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

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
      user: {
        id: user.id,
        email: user.email,
        name: user.name || null,
        avatar: user.avatar || null,
        hasCompletedOnboarding: false,
      },
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
    return this.usersService.completeOnboarding(userId);
  }

  async getProfile(userId: string) {
    const user = await this.usersService.findById(userId);
    if (!user) return null;
    return {
      id: user.id,
      email: user.email,
      name: user.name || null,
      avatar: user.avatar || null,
      hasCompletedOnboarding: user.hasCompletedOnboarding,
    };
  }

  async firebaseLogin(email: string, name?: string, avatar?: string, googleId?: string, farmId?: string) {
    const user = await this.usersService.upsertFromFirebase(email, name, avatar, googleId);

    const userForLogin = {
      id: user.id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      hasCompletedOnboarding: user.hasCompletedOnboarding,
      farms: (user.farms || []).map((uf: any) => ({
        farmId: uf.farmId,
        role: uf.role,
        farm: uf.farm,
      })),
    };

    return this.login(userForLogin, farmId);
  }

  async registerFromFirebase(email: string, name?: string, avatar?: string, googleId?: string) {
    const user = await this.usersService.upsertFromFirebase(email, name, avatar, googleId);

    const payload = {
      email: user.email,
      sub: user.id,
      needsOnboarding: true,
    };
    const access_token = this.jwtService.sign(payload);

    return {
      access_token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name || null,
        avatar: user.avatar || null,
        hasCompletedOnboarding: false,
      },
      needsOnboarding: true,
    };
  }

  async updateAvatar(userId: string, avatar: string) {
    const user = await this.usersService.updateAvatar(userId, avatar);
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      hasCompletedOnboarding: user.hasCompletedOnboarding,
    };
  }

  async deleteAccount(userId: string) {
    await this.usersService.delete(userId);
    return { message: 'Account deleted successfully' };
  }

  async login(user: any, farmId?: string) {
    const userFarms = user.farms || [];
    
    if (!user.hasCompletedOnboarding) {
      const payload: any = {
        email: user.email,
        sub: user.id,
        needsOnboarding: true,
      };
      
      if (userFarms.length > 0) {
        let selectedFarm = userFarms[0];
        if (farmId) {
          const found = userFarms.find(
            (uf: any) => uf.farmId === farmId,
          );
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
          id: user.id,
          email: user.email,
          name: user.name || null,
          avatar: user.avatar || null,
          farmId: userFarms.length > 0 ? (farmId || userFarms[0].farmId) : undefined,
          role: userFarms.length > 0 ? (userFarms.find((uf: any) => uf.farmId === farmId)?.role || userFarms[0].role) : undefined,
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
      const found = userFarms.find(
        (uf: any) => uf.farmId === farmId,
      );
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
        id: user.id,
        email: user.email,
        name: user.name || null,
        avatar: user.avatar || null,
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
