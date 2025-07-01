import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SyncService } from './sync.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { CreateSyncEventDto, GetSyncEventsDto } from './dto/sync.dto.js';

@ApiTags('sync')
@ApiBearerAuth()
@Controller('sync')
@UseGuards(JwtAuthGuard)
export class SyncController {
  constructor(private readonly syncService: SyncService) {}

  @Post('events')
  @ApiOperation({ summary: 'Submit sync events' })
  async submitEvents(
    @Body() dto: CreateSyncEventDto[],
    @Request() req: any
  ) {
    return this.syncService.submitEvents(dto, req.user);
  }

  @Get('events')
  @ApiOperation({ summary: 'Get sync events since timestamp' })
  async getEvents(
    @Query() query: GetSyncEventsDto,
    @Request() req: any
  ) {
    return this.syncService.getEventsSince(
      query.since,
      req.user.tenantId,
      query.limit
    );
  }

  @Get('status')
  @ApiOperation({ summary: 'Get sync status' })
  async getSyncStatus(@Request() req: any) {
    return this.syncService.getSyncStatus(req.user.tenantId);
  }

  @Post('conflict/resolve')
  @ApiOperation({ summary: 'Resolve sync conflict' })
  async resolveConflict(
    @Body() conflictData: any,
    @Request() req: any
  ) {
    return this.syncService.resolveConflict(conflictData, req.user);
  }
}