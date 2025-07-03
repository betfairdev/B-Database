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
import { FieldSchemaService } from './field-schema.service';
import { CreateFieldSchemaDto } from './dto/create-field-schema.dto';
import { UpdateFieldSchemaDto } from './dto/update-field-schema.dto';
import { ReorderFieldsDto } from './dto/reorder-fields.dto';
import { FirebaseAuthGuard } from '../auth/guards/firebase-auth.guard';
import { WorkspaceGuard } from '../auth/guards/workspace.guard';
import { PaginationDto } from '../../common/dto/pagination.dto';

@ApiTags('field-schemas')
@Controller('workspaces/:workspaceId/tables/:tableId/fields')
@UseGuards(FirebaseAuthGuard, WorkspaceGuard)
@ApiBearerAuth()
export class FieldSchemaController {
  constructor(private readonly fieldSchemaService: FieldSchemaService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new field schema' })
  create(
    @Param('tableId') tableId: string,
    @Body() createFieldSchemaDto: CreateFieldSchemaDto,
  ) {
    return this.fieldSchemaService.create({
      ...createFieldSchemaDto,
      tableId,
    });
  }

  @Get()
  @ApiOperation({ summary: 'Get all field schemas in table' })
  findAll(
    @Param('tableId') tableId: string,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.fieldSchemaService.findAll(tableId, paginationDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get field schema by ID' })
  findOne(
    @Param('tableId') tableId: string,
    @Param('id') id: string,
  ) {
    return this.fieldSchemaService.findOne(id, tableId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update field schema' })
  update(
    @Param('tableId') tableId: string,
    @Param('id') id: string,
    @Body() updateFieldSchemaDto: UpdateFieldSchemaDto,
  ) {
    return this.fieldSchemaService.update(id, updateFieldSchemaDto, tableId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete field schema' })
  remove(
    @Param('tableId') tableId: string,
    @Param('id') id: string,
  ) {
    return this.fieldSchemaService.remove(id, tableId);
  }

  @Post('reorder')
  @ApiOperation({ summary: 'Reorder fields' })
  reorderFields(
    @Param('tableId') tableId: string,
    @Body() reorderFieldsDto: ReorderFieldsDto,
  ) {
    return this.fieldSchemaService.reorderFields(tableId, reorderFieldsDto.fields);
  }
}