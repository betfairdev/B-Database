import { Injectable } from '@nestjs/common';
import { AppDataSource } from '../../dbconfig';
import { MinioService } from '../minio/minio.service';

@Injectable()
export class HealthService {
  constructor(private minioService: MinioService) {}

  async check() {
    const database = await this.checkDatabase();
    const storage = await this.checkStorage();

    return {
      status: database.status === 'ok' && storage.status === 'ok' ? 'ok' : 'error',
      timestamp: new Date().toISOString(),
      services: {
        database,
        storage,
      },
    };
  }

  async checkDatabase() {
    try {
      await AppDataSource.query('SELECT 1');
      return {
        status: 'ok',
        message: 'Database connection is healthy',
      };
    } catch (error) {
      return {
        status: 'error',
        message: `Database connection failed: ${error.message}`,
      };
    }
  }

  async checkStorage() {
    try {
      // Try to list buckets to check MinIO connection
      const buckets = await this.minioService['minioClient'].listBuckets();
      return {
        status: 'ok',
        message: 'Storage connection is healthy',
        buckets: buckets.length,
      };
    } catch (error) {
      return {
        status: 'error',
        message: `Storage connection failed: ${error.message}`,
      };
    }
  }
}