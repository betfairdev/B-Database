import { Injectable } from '@nestjs/common';
import { MinioService } from '../minio/minio.service';
import { getRepository } from '../../dbconfig';
import { DataRow } from '../../entities/data-row.entity';

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

  async processFileUpload(
    workspaceId: string,
    tableId: string,
    rowId: string,
    fieldId: string,
    file: Express.Multer.File,
  ): Promise<{ url: string; thumbnailUrl?: string }> {
    const filePath = `workspaces/${workspaceId}/tables/${tableId}/rows/${rowId}/fields/${fieldId}`;
    const fileUrl = await this.minioService.uploadFile(file, filePath);
    
    let thumbnailUrl: string | undefined;
    if (file.mimetype.startsWith('image/')) {
      thumbnailUrl = await this.minioService.generateThumbnail(file, `${filePath}/${file.originalname}-thumb`);
    }

    // Update the data row with file URLs
    const dataRowRepository = getRepository(DataRow);
    const dataRow = await dataRowRepository.findOne({
      where: { id: rowId, tableId },
    });

    if (dataRow) {
      if (!dataRow.payload[fieldId]) {
        dataRow.payload[fieldId] = [];
      }
      
      dataRow.payload[fieldId].push({
        url: fileUrl,
        thumbnailUrl,
        fileName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        uploadedAt: new Date(),
      });

      await dataRowRepository.save(dataRow);
    }

    return { url: fileUrl, thumbnailUrl };
  }
}