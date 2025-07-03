import { Injectable } from '@nestjs/common';
import { MinioService } from '../minio/minio.service';

@Injectable()
export class FileService {
  constructor(private minioService: MinioService) {}

  async getUploadUrl(
    workspaceId: string,
    tableId: string,
    rowId: string,
    fieldId: string,
    fileName: string,
  ): Promise<string> {
    const filePath = `workspaces/${workspaceId}/tables/${tableId}/rows/${rowId}/fields/${fieldId}/${fileName}`;
    return this.minioService.getPresignedUploadUrl(filePath);
  }

  async deleteRowFiles(workspaceId: string, tableId: string, rowId: string): Promise<void> {
    const folderPath = `workspaces/${workspaceId}/tables/${tableId}/rows/${rowId}`;
    await this.minioService.deleteFolder(folderPath);
  }

  async deleteTableFiles(workspaceId: string, tableId: string): Promise<void> {
    const folderPath = `workspaces/${workspaceId}/tables/${tableId}`;
    await this.minioService.deleteFolder(folderPath);
  }

  async deleteWorkspaceFiles(workspaceId: string): Promise<void> {
    const folderPath = `workspaces/${workspaceId}`;
    await this.minioService.deleteFolder(folderPath);
  }
}