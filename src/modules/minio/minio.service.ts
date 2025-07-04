import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';
import * as sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class MinioService implements OnModuleInit {
  private minioClient: Minio.Client;
  private bucketName: string;

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    this.bucketName = this.configService.get<string>('MINIO_BUCKET_NAME', 'app-files');
    
    this.minioClient = new Minio.Client({
      endPoint: this.configService.get<string>('MINIO_ENDPOINT', 'localhost'),
      port: this.configService.get<number>('MINIO_PORT', 9000),
      useSSL: this.parseBoolean(this.configService.get<string>('MINIO_USE_SSL', 'false')),
      accessKey: this.configService.get<string>('MINIO_ACCESS_KEY', 'minioadmin'),
      secretKey: this.configService.get<string>('MINIO_SECRET_KEY', 'minioadmin'),
    });

    // Create bucket if it doesn't exist
    const bucketExists = await this.minioClient.bucketExists(this.bucketName);
    if (!bucketExists) {
      await this.minioClient.makeBucket(this.bucketName);
    }
  }

  async uploadFile(file: Express.Multer.File, path: string): Promise<string> {
    const fileName = `${path}/${uuidv4()}-${file.originalname}`;
    
    await this.minioClient.putObject(
      this.bucketName,
      fileName,
      file.buffer,
      file.size,
      {
        'Content-Type': file.mimetype,
      },
    );

    // Generate thumbnail for images
    if (file.mimetype.startsWith('image/')) {
      await this.generateThumbnail(file, `${fileName}-thumb`);
    }

    return this.getFileUrl(fileName);
  }

  async generateThumbnail(file: Express.Multer.File, thumbnailPath: string): Promise<string> {
    const thumbnailBuffer = await sharp(file.buffer)
      .resize(200, 200, { fit: 'cover' })
      .jpeg({ quality: 80 })
      .toBuffer();

    await this.minioClient.putObject(
      this.bucketName,
      thumbnailPath,
      thumbnailBuffer,
      thumbnailBuffer.length,
      {
        'Content-Type': 'image/jpeg',
      },
    );

    return this.getFileUrl(thumbnailPath);
  }

  async deleteFile(fileName: string): Promise<void> {
    await this.minioClient.removeObject(this.bucketName, fileName);
  }

  async deleteFolder(folderPath: string): Promise<void> {
    const objectsList = this.minioClient.listObjects(this.bucketName, folderPath, true);
    const objectsToDelete = [];

    for await (const obj of objectsList) {
      objectsToDelete.push(obj.name);
    }

    if (objectsToDelete.length > 0) {
      await this.minioClient.removeObjects(this.bucketName, objectsToDelete);
    }
  }

  async getPresignedUploadUrl(fileName: string, expiry: number = 3600): Promise<string> {
    return this.minioClient.presignedPutObject(this.bucketName, fileName, expiry);
  }

  private getFileUrl(fileName: string): string {
    const endpoint = this.configService.get<string>('MINIO_ENDPOINT');
    const port = this.configService.get<number>('MINIO_PORT');
    const useSSL = this.configService.get<boolean>('MINIO_USE_SSL');
    const protocol = useSSL ? 'https' : 'http';
    
    return `${protocol}://${endpoint}:${port}/${this.bucketName}/${fileName}`;
  }

  private parseBoolean(value: string | undefined): boolean {
    if (typeof value === 'string') {
      return value.toLowerCase() === 'true';
    }
    return Boolean(value);
  }
}