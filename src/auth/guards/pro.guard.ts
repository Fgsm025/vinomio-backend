import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ProGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user as { userId?: string } | undefined;

    const userId = user?.userId;
    if (!userId) {
      throw new ForbiddenException('Not authenticated');
    }

    const dbUser = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { planStatus: true, endsAt: true },
    });

    if (!dbUser) {
      throw new ForbiddenException('User not found');
    }

    const planStatusOk =
      dbUser.planStatus === 'active' || dbUser.planStatus === 'on_trial';
    const now = new Date();
    const endsAtOk = dbUser.endsAt === null || dbUser.endsAt > now;

    if (!planStatusOk || !endsAtOk) {
      throw new ForbiddenException('Pro subscription required');
    }

    return true;
  }
}

