import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '../enums/role.enum';

export const ROLES_KEY = 'roles';

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
    const userRole = request.userRole;

    if (!userRole) {
      throw new ForbiddenException('User role not found');
    }

    const roleHierarchy = {
      [Role.VIEWER]: 1,
      [Role.EDITOR]: 2,
      [Role.OWNER]: 3,
    };

    const hasPermission = requiredRoles.some(
      (role) => roleHierarchy[userRole] >= roleHierarchy[role],
    );

    if (!hasPermission) {
      throw new ForbiddenException('Insufficient permissions');
    }

    return true;
  }
}