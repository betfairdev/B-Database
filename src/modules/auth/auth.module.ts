import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { FirebaseAuthGuard } from './guards/firebase-auth.guard';
import { WorkspaceGuard } from './guards/workspace.guard';

@Module({
  providers: [AuthService, FirebaseAuthGuard, WorkspaceGuard],
  controllers: [AuthController],
  exports: [AuthService, FirebaseAuthGuard, WorkspaceGuard],
})
export class AuthModule {}