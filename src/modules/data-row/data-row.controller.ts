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
import { DataRowService } from './data-row.service';
import { CreateDataRowDto } from './dto/create-data-row.dto';
import { UpdateDataRowDto } from './dto/update-data-row.dto';
import { FirebaseAuthGuard } from '../auth/guards/firebase-auth.guard';
import { WorkspaceGuard } from '../auth/guards/workspace.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../../entities/user.entity';
import { PaginationDto } from '../../common/dto/pagination.dto';

@ApiTags('data-rows')
@Controller('workspaces/:workspaceId/tables/:tableId/rows')
@UseGuards(FirebaseAuthGuard, WorkspaceGuard)
@ApiBearerAuth()
export class DataRowController {
  constructor(private readonly dataRowService: DataRowService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new data row' })
  create(
    @Param('tableId') tableId: string,
    @Body() createDataRowDto: CreateDataRowDto,
    @CurrentUser() user: User,
  ) {
    return this.dataRowService.create({
      ...createDataRowDto,
      tableId,
    }, user);
  }

  @Get()
  @ApiOperation({ summary: 'Get all data rows in table' })
  findAll(
    @Param('tableId') tableId: string,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.dataRowService.findAll(tableId, paginationDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get data row by ID' })
  findOne(
    @Param('tableId') tableId: string,
    @Param('id') id: string,
  ) {
    return this.dataRowService.findOne(id, tableId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update data row' })
  update(
    @Param('tableId') tableId: string,
    @Param('id') id: string,
    @Body() updateDataRowDto: UpdateDataRowDto,
    @CurrentUser() user: User,
  ) {
    return this.dataRowService.update(id, updateDataRowDto, tableId, user);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete data row' })
  remove(
    @Param('tableId') tableId: string,
    @Param('id') id: string,
  ) {
    return this.dataRowService.softDelete(id, tableId);
  }

  @Delete(':id/hard')
  @ApiOperation({ summary: 'Hard delete data row' })
  hardDelete(
    @Param('tableId') tableId: string,
    @Param('id') id: string,
  ) {
    return this.dataRowService.hardDelete(id, tableId);
  }

  @Post(':id/restore')
  @ApiOperation({ summary: 'Restore soft deleted data row' })
  restore(
    @Param('tableId') tableId: string,
    @Param('id') id: string,
  ) {
    return this.dataRowService.restore(id, tableId);
  }

  @Get(':id/history')
  @ApiOperation({ summary: 'Get data row history' })
  getHistory(
    @Param('tableId') tableId: string,
    @Param('id') id: string,
  ) {
    return this.dataRowService.getHistory(id, tableId);
  }
}