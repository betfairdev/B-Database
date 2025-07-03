import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { RelationshipService } from './relationship.service';
import { CreateRelationshipDto } from './dto/create-relationship.dto';
import { UpdateRelationshipDto } from './dto/update-relationship.dto';
import { FirebaseAuthGuard } from '../auth/guards/firebase-auth.guard';
import { WorkspaceGuard } from '../auth/guards/workspace.guard';
import { PaginationDto } from '../../common/dto/pagination.dto';

@ApiTags('relationships')
@Controller('workspaces/:workspaceId/relationships')
@UseGuards(FirebaseAuthGuard, WorkspaceGuard)
@ApiBearerAuth()
export class RelationshipController {
  constructor(private readonly relationshipService: RelationshipService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new relationship' })
  create(@Body() createRelationshipDto: CreateRelationshipDto) {
    return this.relationshipService.create(createRelationshipDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all relationships in workspace' })
  findAll(
    @Param('workspaceId') workspaceId: string,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.relationshipService.findAll(workspaceId, paginationDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get relationship by ID' })
  findOne(@Param('id') id: string) {
    return this.relationshipService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update relationship' })
  update(
    @Param('id') id: string,
    @Body() updateRelationshipDto: UpdateRelationshipDto,
  ) {
    return this.relationshipService.update(id, updateRelationshipDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete relationship' })
  remove(@Param('id') id: string) {
    return this.relationshipService.remove(id);
  }
}