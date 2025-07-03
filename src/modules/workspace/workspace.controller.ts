import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiConsumes } from '@nestjs/swagger';
import { WorkspaceService } from './workspace.service';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';
import { AddUserToWorkspaceDto } from './dto/add-user-to-workspace.dto';
import { FirebaseAuthGuard } from '../auth/guards/firebase-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../../entities/user.entity';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { MinioService } from '../minio/minio.service';

@ApiTags('workspaces')
@Controller('workspaces')
@UseGuards(FirebaseAuthGuard)
@ApiBearerAuth()
export class WorkspaceController {
  constructor(
    private readonly workspaceService: WorkspaceService,
    private readonly minioService: MinioService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new workspace' })
  create(@Body() createWorkspaceDto: CreateWorkspaceDto, @CurrentUser() user: User) {
    return this.workspaceService.create(createWorkspaceDto, user);
  }

  @Get()
  @ApiOperation({ summary: 'Get all workspaces for current user' })
  findAll(@Query() paginationDto: PaginationDto, @CurrentUser() user: User) {
    return this.workspaceService.findAll(user, paginationDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get workspace by ID' })
  findOne(@Param('id') id: string, @CurrentUser() user: User) {
    return this.workspaceService.findOne(id, user);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update workspace' })
  update(
    @Param('id') id: string,
    @Body() updateWorkspaceDto: UpdateWorkspaceDto,
    @CurrentUser() user: User,
  ) {
    return this.workspaceService.update(id, updateWorkspaceDto, user);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete workspace' })
  remove(@Param('id') id: string, @CurrentUser() user: User) {
    return this.workspaceService.remove(id, user);
  }

  @Post(':id/thumbnail')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload workspace thumbnail' })
  async uploadThumbnail(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: User,
  ) {
    const workspace = await this.workspaceService.findOne(id, user);
    const thumbnailUrl = await this.minioService.uploadFile(
      file,
      `workspaces/${id}/thumbnail`,
    );
    
    return this.workspaceService.update(id, { thumbnailUrl }, user);
  }

  @Post(':id/users')
  @ApiOperation({ summary: 'Add user to workspace' })
  addUser(
    @Param('id') workspaceId: string,
    @Body() addUserDto: AddUserToWorkspaceDto,
    @CurrentUser() user: User,
  ) {
    return this.workspaceService.addUserToWorkspace(
      workspaceId,
      addUserDto.userId,
      addUserDto.role,
      user,
    );
  }
}