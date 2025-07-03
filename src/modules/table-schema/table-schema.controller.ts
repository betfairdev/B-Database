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
import { TableSchemaService } from './table-schema.service';
import { CreateTableSchemaDto } from './dto/create-table-schema.dto';
import { UpdateTableSchemaDto } from './dto/update-table-schema.dto';
import { FirebaseAuthGuard } from '../auth/guards/firebase-auth.guard';
import { WorkspaceGuard } from '../auth/guards/workspace.guard';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { MinioService } from '../minio/minio.service';

@ApiTags('table-schemas')
@Controller('workspaces/:workspaceId/tables')
@UseGuards(FirebaseAuthGuard, WorkspaceGuard)
@ApiBearerAuth()
export class TableSchemaController {
  constructor(
    private readonly tableSchemaService: TableSchemaService,
    private readonly minioService: MinioService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new table schema' })
  create(
    @Param('workspaceId') workspaceId: string,
    @Body() createTableSchemaDto: CreateTableSchemaDto,
  ) {
    return this.tableSchemaService.create({
      ...createTableSchemaDto,
      workspaceId,
    });
  }

  @Get()
  @ApiOperation({ summary: 'Get all table schemas in workspace' })
  findAll(
    @Param('workspaceId') workspaceId: string,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.tableSchemaService.findAll(workspaceId, paginationDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get table schema by ID' })
  findOne(
    @Param('workspaceId') workspaceId: string,
    @Param('id') id: string,
  ) {
    return this.tableSchemaService.findOne(id, workspaceId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update table schema' })
  update(
    @Param('workspaceId') workspaceId: string,
    @Param('id') id: string,
    @Body() updateTableSchemaDto: UpdateTableSchemaDto,
  ) {
    return this.tableSchemaService.update(id, updateTableSchemaDto, workspaceId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete table schema' })
  remove(
    @Param('workspaceId') workspaceId: string,
    @Param('id') id: string,
  ) {
    return this.tableSchemaService.remove(id, workspaceId);
  }

  @Post(':id/thumbnail')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload table thumbnail' })
  async uploadThumbnail(
    @Param('workspaceId') workspaceId: string,
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const thumbnailUrl = await this.minioService.uploadFile(
      file,
      `workspaces/${workspaceId}/tables/${id}/thumbnail`,
    );
    
    return this.tableSchemaService.update(id, { thumbnailUrl }, workspaceId);
  }
}