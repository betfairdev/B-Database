import {
  Controller,
  Get,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Param,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery, ApiConsumes } from '@nestjs/swagger';
import { FileService } from './file.service';
import { FirebaseAuthGuard } from '../auth/guards/firebase-auth.guard';
import { WorkspaceGuard } from '../auth/guards/workspace.guard';

@ApiTags('files')
@Controller('files')
@UseGuards(FirebaseAuthGuard, WorkspaceGuard)
@ApiBearerAuth()
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @Get('upload-url')
  @ApiOperation({ summary: 'Get presigned upload URL for file' })
  @ApiQuery({ name: 'workspaceId', required: true })
  @ApiQuery({ name: 'tableId', required: true })
  @ApiQuery({ name: 'rowId', required: true })
  @ApiQuery({ name: 'fieldId', required: true })
  @ApiQuery({ name: 'fileName', required: true })
  async getUploadUrl(
    @Query('workspaceId') workspaceId: string,
    @Query('tableId') tableId: string,
    @Query('rowId') rowId: string,
    @Query('fieldId') fieldId: string,
    @Query('fileName') fileName: string,
  ) {
    const uploadUrl = await this.fileService.getUploadUrl(
      workspaceId,
      tableId,
      rowId,
      fieldId,
      fileName,
    );

    return { uploadUrl };
  }

  @Post('upload/:workspaceId/:tableId/:rowId/:fieldId')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload file directly' })
  async uploadFile(
    @Param('workspaceId') workspaceId: string,
    @Param('tableId') tableId: string,
    @Param('rowId') rowId: string,
    @Param('fieldId') fieldId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.fileService.processFileUpload(
      workspaceId,
      tableId,
      rowId,
      fieldId,
      file,
    );
  }
}