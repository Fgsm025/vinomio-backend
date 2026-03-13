import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role, ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    const hasRole = requiredRoles.some((role) => user.role === role);

    if (!hasRole) {
      throw new ForbiddenException(
        `Access denied. Required roles: ${requiredRoles.join(', ')}`,
      );
    }

    // Extra operator restrictions: execution-only, no configuration/finance/team.
    if (user.role === 'OPERATOR') {
      const method = request.method as string;
      const path: string = request.route?.path || '';
      const controller = context.getClass().name;

      // Block any access to purchases and invitations controllers entirely
      if (controller === 'PurchasesController' || controller === 'InvitationsController') {
        throw new ForbiddenException('Operators are not allowed to access this resource');
      }

      // Allow operators to create/update/complete tasks, attendance and related execution flows.
      const isExecutionController =
        controller === 'TasksController' || controller === 'AttendanceController';

      if (isExecutionController) {
        // For execution controllers, allow POST and PATCH, always allow safe GETs
        if (method === 'POST' || method === 'PATCH' || method === 'GET') {
          return true;
        }
        // Block destructive methods just in case
        if (method === 'DELETE') {
          throw new ForbiddenException(
            'Operators are not allowed to delete resources in this module',
          );
        }
      }
    }

    return true;
  }
}
