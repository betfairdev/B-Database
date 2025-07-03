import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { getRepository } from '../../../dbconfig';
import { WorkspaceUserRole } from '../../../entities/workspace-user-role.entity';
import { Role } from '../../../common/enums/role.enum';

@Injectable()
export class WorkspaceGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const workspaceId = request.params.workspaceId || request.query.workspaceId || request.body.workspaceId;

    if (!workspaceId) {
      throw new BadRequestException('Workspace ID is required');
    }

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    const workspaceUserRoleRepository = getRepository(WorkspaceUserRole);
    const userRole = await workspaceUserRoleRepository.findOne({
      where: {
        userId: user.id,
        workspaceId,
      },
    });

    if (!userRole) {
      throw new ForbiddenException('Access denied to workspace');
    }

    request.userRole = userRole.role;
    request.workspaceId = workspaceId;
    return true;
  }
}

export const RequireRole = (requiredRole: Role) => {
  return (target: any, propertyName: string, descriptor: PropertyDescriptor) => {
    const method = descriptor.value;
    descriptor.value = function (...args: any[]) {
      const request = args.find(arg => arg && arg.userRole);
      if (!request) {
        throw new ForbiddenException('Role information not available');
      }

      const roleHierarchy = {
        [Role.VIEWER]: 1,
        [Role.EDITOR]: 2,
        [Role.OWNER]: 3,
      };

      if (roleHierarchy[request.userRole] < roleHierarchy[requiredRole]) {
        throw new ForbiddenException(`Requires ${requiredRole} role or higher`);
      }

      return method.apply(this, args);
    };
  };
};