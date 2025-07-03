import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Relationship } from '../../entities/relationship.entity';
import { WorkspaceUserRole } from '../../entities/workspace-user-role.entity';
import { RelationshipService } from './relationship.service';
import { RelationshipController } from './relationship.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Relationship, WorkspaceUserRole]),
    AuthModule,
  ],
  providers: [RelationshipService],
  controllers: [RelationshipController],
  exports: [RelationshipService],
})
export class RelationshipModule {}