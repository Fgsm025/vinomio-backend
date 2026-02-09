import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

export interface JwtPayload {
  sub: string;
  email: string;
  exploitationId?: string;
  role?: string;
  needsOnboarding?: boolean;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'your-secret-key',
    });
  }

  async validate(payload: JwtPayload) {
    if (payload.needsOnboarding) {
      return {
        userId: payload.sub,
        email: payload.email,
        needsOnboarding: true,
      };
    }

    if (!payload.exploitationId || !payload.role) {
      return null;
    }

    return {
      userId: payload.sub,
      email: payload.email,
      exploitationId: payload.exploitationId,
      role: payload.role,
    };
  }
}
