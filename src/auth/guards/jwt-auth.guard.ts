import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any) {
    if (err || !user) {
      throw err instanceof Error && err.message !== 'Unauthorized'
        ? err
        : new UnauthorizedException('Session expired or invalid. Please sign in again.');
    }
    return user;
  }
}
