import { Injectable, NotFoundException } from '@nestjs/common';
import { getRepository } from '../../../dbconfig';
import { TableSchema } from '../../entities/table-schema.entity';
import { CreateTableSchemaDto } from './dto/create-table-schema.dto';
import { UpdateTableSchemaDto } from './dto/update-table-schema.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';

@Injectable()
export class TableSchemaService {
  async create(createTableSchemaDto: CreateTableSchemaDto): Promise<TableSchema> {
    const tableSchemaRepository = getRepository(TableSchema);
    const tableSchema = tableSchemaRepository.create(createTableSchemaDto);
    return tableSchemaRepository.save(tableSchema);
  }

  async findAll(workspaceId: string, paginationDto: PaginationDto) {
    const { page, limit, search, sortBy, sortOrder } = paginationDto;
    const skip = (page - 1) * limit;

    const tableSchemaRepository = getRepository(TableSchema);
    const queryBuilder = tableSchemaRepository
      .createQueryBuilder('table')
      .where('table.workspaceId = :workspaceId', { workspaceId });

    if (search) {
      queryBuilder.andWhere(
        '(table.name ILIKE :search OR table.displayName ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (sortBy) {
      queryBuilder.orderBy(`table.${sortBy}`, sortOrder);
    } else {
      queryBuilder.orderBy('table.createdAt', sortOrder);
    }

    const [tables, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return {
      data: tables,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page < Math.ceil(total / limit),
      hasPrevPage: page > 1,
    };
  }

  async findOne(id: string, workspaceId: string): Promise<TableSchema> {
    const tableSchemaRepository = getRepository(TableSchema);
    const table = await tableSchemaRepository.findOne({
      where: { id, workspaceId },
      relations: ['fields'],
    });

    if (!table) {
      throw new NotFoundException('Table not found');
    }

    return table;
  }

  async update(id: string, updateTableSchemaDto: UpdateTableSchemaDto, workspaceId: string): Promise<TableSchema> {
    const tableSchemaRepository = getRepository(TableSchema);
    const table = await this.findOne(id, workspaceId);
    Object.assign(table, updateTableSchemaDto);
    return tableSchemaRepository.save(table);
  }

  async remove(id: string, workspaceId: string): Promise<void> {
    const tableSchemaRepository = getRepository(TableSchema);
    const table = await this.findOne(id, workspaceId);
    await tableSchemaRepository.remove(table);
  }
}