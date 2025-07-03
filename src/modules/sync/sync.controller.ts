import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { SyncService } from './sync.service';
import { PushSyncDto } from './dto/push-sync.dto';
import { PullSyncDto } from './dto/pull-sync.dto';
import { FirebaseAuthGuard } from '../auth/guards/firebase-auth.guard';
import { WorkspaceGuard } from '../auth/guards/workspace.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../../entities/user.entity';

@ApiTags('sync')
@Controller('sync')
@UseGuards(FirebaseAuthGuard, WorkspaceGuard)
@ApiBearerAuth()
export class SyncController {
  constructor(private readonly syncService: SyncService) {}

  @Post('push')
  @ApiOperation({ summary: 'Push local changes to server' })
  pushChanges(@Body() pushSyncDto: PushSyncDto, @CurrentUser() user: User) {
    return this.syncService.pushChanges(pushSyncDto, user);
  }

  @Get('pull')
  @ApiOperation({ summary: 'Pull changes from server' })
  pullChanges(@Query() pullSyncDto: PullSyncDto) {
    return this.syncService.pullChanges(pullSyncDto);
  }
}