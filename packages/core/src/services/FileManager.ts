import * as fs from 'fs/promises';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { FileMeta } from '../entity/FileMeta';
import { Repository } from 'typeorm';
import { ThumbnailService } from './ThumbnailService';

export interface FileManagerConfig {
  storageAdapter: 'local' | 'memory' | 'cloud';
  basePath?: string;
  removeOrphansOnPurge?: boolean;
  thumbnailSizes?: number[];
}

export class FileManager {
  private thumbnailService: ThumbnailService;

  constructor(
    private config: FileManagerConfig,
    private fileMetaRepository: Repository<FileMeta>
  ) {
    this.thumbnailService = new ThumbnailService();
    this.ensureStorageDirectory();
  }

  async save(file: Buffer | File, metadata: {
    originalName: string;
    mimeType: string;
    table?: string;
    recordId?: string;
    field?: string;
  }): Promise<FileMeta> {
    const fileId = uuidv4();
    const extension = path.extname(metadata.originalName);
    const fileName = `${fileId}${extension}`;
    const filePath = this.getFilePath(fileName);

    // Save file to storage
    await this.writeFile(filePath, file);

    // Generate thumbnail if it's an image
    let thumbnail: string | undefined;
    if (metadata.mimeType.startsWith('image/')) {
      thumbnail = await this.thumbnailService.generate(file instanceof Buffer ? file : await this.fileToBuffer(file));
    }

    // Calculate file size
    const size = file instanceof Buffer ? file.length : file.size;

    // Create file metadata record
    const fileMeta = this.fileMetaRepository.create({
      id: fileId,
      originalName: metadata.originalName,
      fileName,
      filePath,
      mimeType: metadata.mimeType,
      size,
      thumbnail,
      table: metadata.table,
      recordId: metadata.recordId,
      field: metadata.field
    });

    return await this.fileMetaRepository.save(fileMeta);
  }

  async get(fileId: string): Promise<{ file: Buffer; metadata: FileMeta } | null> {
    const fileMeta = await this.fileMetaRepository.findOne({ where: { id: fileId } });
    if (!fileMeta) return null;

    const fileBuffer = await this.readFile(fileMeta.filePath);
    return { file: fileBuffer, metadata: fileMeta };
  }

  async delete(fileId: string, hardDelete = false): Promise<boolean> {
    const fileMeta = await this.fileMetaRepository.findOne({ where: { id: fileId } });
    if (!fileMeta) return false;

    if (hardDelete) {
      // Remove physical file
      await this.removeFile(fileMeta.filePath);
      // Remove database record
      await this.fileMetaRepository.remove(fileMeta);
    } else {
      // Soft delete
      fileMeta.deletedAt = new Date();
      await this.fileMetaRepository.save(fileMeta);
    }

    return true;
  }

  async purgeOrphans(): Promise<number> {
    if (!this.config.removeOrphansOnPurge) return 0;

    // Find files that are not referenced by any records
    const orphanedFiles = await this.fileMetaRepository
      .createQueryBuilder('file')
      .where('file.table IS NULL OR file.recordId IS NULL')
      .andWhere('file.deletedAt IS NOT NULL')
      .getMany();

    let purgedCount = 0;
    for (const file of orphanedFiles) {
      await this.removeFile(file.filePath);
      await this.fileMetaRepository.remove(file);
      purgedCount++;
    }

    return purgedCount;
  }

  private async ensureStorageDirectory(): Promise<void> {
    if (this.config.storageAdapter === 'local' && this.config.basePath) {
      try {
        await fs.access(this.config.basePath);
      } catch {
        await fs.mkdir(this.config.basePath, { recursive: true });
      }
    }
  }

  private getFilePath(fileName: string): string {
    if (this.config.storageAdapter === 'local') {
      return path.join(this.config.basePath || './uploads', fileName);
    }
    return fileName;
  }

  private async writeFile(filePath: string, data: Buffer | File): Promise<void> {
    if (this.config.storageAdapter === 'local') {
      const buffer = data instanceof Buffer ? data : await this.fileToBuffer(data);
      await fs.writeFile(filePath, buffer);
    }
    // Add other storage adapters here (cloud, memory, etc.)
  }

  private async readFile(filePath: string): Promise<Buffer> {
    if (this.config.storageAdapter === 'local') {
      return await fs.readFile(filePath);
    }
    throw new Error(`Storage adapter ${this.config.storageAdapter} not implemented`);
  }

  private async removeFile(filePath: string): Promise<void> {
    if (this.config.storageAdapter === 'local') {
      try {
        await fs.unlink(filePath);
      } catch (error) {
        // File might not exist, ignore error
      }
    }
  }

  private async fileToBuffer(file: File): Promise<Buffer> {
    const arrayBuffer = await file.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }
}