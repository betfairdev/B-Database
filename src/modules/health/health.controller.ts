import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { HealthService } from './health.service';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @ApiOperation({ summary: 'Health check endpoint' })
  async check() {
    return this.healthService.check();
  }

  @Get('database')
  @ApiOperation({ summary: 'Database health check' })
  async checkDatabase() {
    return this.healthService.checkDatabase();
  }

  @Get('storage')
  @ApiOperation({ summary: 'Storage health check' })
  async checkStorage() {
    return this.healthService.checkStorage();
  }
}