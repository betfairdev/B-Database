import { Module } from '@nestjs/common';
import { DataRowService } from './data-row.service';
import { DataRowController } from './data-row.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  providers: [DataRowService],
  controllers: [DataRowController],
  exports: [DataRowService],
})
export class DataRowModule {}