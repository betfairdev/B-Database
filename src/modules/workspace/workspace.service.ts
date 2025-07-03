import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Workspace } from '../../entities/workspace.entity';
import { WorkspaceUserRole } from '../../entities/workspace-user-role.entity';
import { User } from '../../entities/user.entity';
import { Role } from '../../common/enums/role.enum';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';

@Injectable()
export class WorkspaceService {
  constructor(
    @InjectRepository(Workspace)
    private workspaceRepository: Repository<Workspace>,
    @InjectRepository(WorkspaceUserRole)
    private workspaceUserRoleRepository: Repository<WorkspaceUserRole>,
  ) {}

  async create(createWorkspaceDto: CreateWorkspaceDto, user: User): Promise<Workspace> {
    const workspace = this.workspaceRepository.create({
      ...createWorkspaceDto,
      ownerId: user.id,
    });

    const savedWorkspace = await this.workspaceRepository.save(workspace);

    // Create owner role
    const ownerRole = this.workspaceUserRoleRepository.create({
      userId: user.id,
      workspaceId: savedWorkspace.id,
      role: Role.OWNER,
    });
    await this.workspaceUserRoleRepository.save(ownerRole);

    return savedWorkspace;
  }

  async findAll(user: User, paginationDto: PaginationDto) {
    const { page, limit, search, sortBy, sortOrder } = paginationDto;
    const skip = (page - 1) * limit;

    const queryBuilder = this.workspaceRepository
      .createQueryBuilder('workspace')
      .innerJoin('workspace.userRoles', 'userRole')
      .where('userRole.userId = :userId', { userId: user.id });

    if (search) {
      queryBuilder.andWhere(
        '(workspace.name ILIKE :search OR workspace.displayName ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (sortBy) {
      queryBuilder.orderBy(`workspace.${sortBy}`, sortOrder);
    } else {
      queryBuilder.orderBy('workspace.createdAt', sortOrder);
    }

    const [workspaces, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return {
      data: workspaces,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page < Math.ceil(total / limit),
      hasPrevPage: page > 1,
    };
  }

  async findOne(id: string, user: User): Promise<Workspace> {
    const workspace = await this.workspaceRepository
      .createQueryBuilder('workspace')
      .innerJoin('workspace.userRoles', 'userRole')
      .where('workspace.id = :id', { id })
      .andWhere('userRole.userId = :userId', { userId: user.id })
      .getOne();

    if (!workspace) {
      throw new NotFoundException('Workspace not found');
    }

    return workspace;
  }

  async update(id: string, updateWorkspaceDto: UpdateWorkspaceDto, user: User): Promise<Workspace> {
    const workspace = await this.findOne(id, user);
    
    // Check if user is owner
    const userRole = await this.workspaceUserRoleRepository.findOne({
      where: { userId: user.id, workspaceId: id },
    });

    if (userRole.role !== Role.OWNER) {
      throw new ForbiddenException('Only workspace owners can update workspace');
    }

    Object.assign(workspace, updateWorkspaceDto);
    return this.workspaceRepository.save(workspace);
  }

  async remove(id: string, user: User): Promise<void> {
    const workspace = await this.findOne(id, user);
    
    // Check if user is owner
    const userRole = await this.workspaceUserRoleRepository.findOne({
      where: { userId: user.id, workspaceId: id },
    });

    if (userRole.role !== Role.OWNER) {
      throw new ForbiddenException('Only workspace owners can delete workspace');
    }

    await this.workspaceRepository.remove(workspace);
  }

  async addUserToWorkspace(workspaceId: string, userId: string, role: Role, currentUser: User): Promise<WorkspaceUserRole> {
    // Check if current user is owner
    const currentUserRole = await this.workspaceUserRoleRepository.findOne({
      where: { userId: currentUser.id, workspaceId },
    });

    if (currentUserRole.role !== Role.OWNER) {
      throw new ForbiddenException('Only workspace owners can add users');
    }

    const existingRole = await this.workspaceUserRoleRepository.findOne({
      where: { userId, workspaceId },
    });

    if (existingRole) {
      existingRole.role = role;
      return this.workspaceUserRoleRepository.save(existingRole);
    }

    const newRole = this.workspaceUserRoleRepository.create({
      userId,
      workspaceId,
      role,
    });

    return this.workspaceUserRoleRepository.save(newRole);
  }
}