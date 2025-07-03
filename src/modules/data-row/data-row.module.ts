import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataRow } from '../../entities/data-row.entity';
import { DataHistory } from '../../entities/data-history.entity';
import { WorkspaceUserRole } from '../../entities/workspace-user-role.entity';
import { DataRowService } from './data-row.service';
import { DataRowController } from './data-row.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([DataRow, DataHistory, WorkspaceUserRole]),
    AuthModule,
  ],
  providers: [DataRowService],
  controllers: [DataRowController],
  exports: [DataRowService],
})
export class DataRowModule {}