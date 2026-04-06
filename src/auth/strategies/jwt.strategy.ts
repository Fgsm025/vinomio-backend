import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import type { Request } from 'express';

export interface JwtPayload {
  sub: string;
  email: string;
  farmId?: string;
  role?: string;
  needsOnboarding?: boolean;
}

function extractJwt(req: Request): string | null {
  const fromCookie = req.cookies?.auth_token;
  if (fromCookie) return fromCookie;
  return ExtractJwt.fromAuthHeaderAsBearerToken()(req);
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: extractJwt,
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

    if (!payload.farmId || !payload.role) {
      return null;
    }

    return {
      userId: payload.sub,
      email: payload.email,
      farmId: payload.farmId,
      role: payload.role,
    };
  }
}
