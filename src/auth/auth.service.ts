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

  async login(user: any, exploitationId?: string) {
    if (!user.hasCompletedOnboarding && (!user.exploitations || user.exploitations.length === 0)) {
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
          hasCompletedOnboarding: false,
        },
        needsOnboarding: true,
      };
    }

    const userExploitations = user.exploitations || [];
    
    if (userExploitations.length === 0) {
      throw new Error('User has no exploitations assigned');
    }

    let selectedExploitation = userExploitations[0];
    if (exploitationId) {
      const found = userExploitations.find(
        (ue: any) => ue.exploitationId === exploitationId,
      );
      if (found) {
        selectedExploitation = found;
      }
    }

    const payload = {
      email: user.email,
      sub: user.id,
      exploitationId: selectedExploitation.exploitationId,
      role: selectedExploitation.role,
    };
    const access_token = this.jwtService.sign(payload);

    return {
      access_token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name || null,
        exploitationId: selectedExploitation.exploitationId,
        role: selectedExploitation.role,
        hasCompletedOnboarding: user.hasCompletedOnboarding,
        exploitations: userExploitations.map((ue: any) => ({
          id: ue.exploitationId,
          name: ue.exploitation.name,
          role: ue.role,
        })),
      },
      needsOnboarding: false,
    };
  }
}
