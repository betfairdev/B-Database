import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../entities/user.entity';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { FirebaseAuthGuard } from './guards/firebase-auth.guard';
import { WorkspaceGuard } from './guards/workspace.guard';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [AuthService, FirebaseAuthGuard, WorkspaceGuard],
  controllers: [AuthController],
  exports: [AuthService, FirebaseAuthGuard, WorkspaceGuard],
})
export class AuthModule {}