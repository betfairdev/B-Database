import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TableSchema } from '../../entities/table-schema.entity';
import { User } from '../../entities/user.entity';
import { CreateTableSchemaDto } from './dto/create-table-schema.dto';
import { UpdateTableSchemaDto } from './dto/update-table-schema.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';

@Injectable()
export class TableSchemaService {
  constructor(
    @InjectRepository(TableSchema)
    private tableSchemaRepository: Repository<TableSchema>,
  ) {}

  async create(createTableSchemaDto: CreateTableSchemaDto): Promise<TableSchema> {
    const tableSchema = this.tableSchemaRepository.create(createTableSchemaDto);
    return this.tableSchemaRepository.save(tableSchema);
  }

  async findAll(workspaceId: string, paginationDto: PaginationDto) {
    const { page, limit, search, sortBy, sortOrder } = paginationDto;
    const skip = (page - 1) * limit;

    const queryBuilder = this.tableSchemaRepository
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
    const table = await this.tableSchemaRepository.findOne({
      where: { id, workspaceId },
      relations: ['fields'],
    });

    if (!table) {
      throw new NotFoundException('Table not found');
    }

    return table;
  }

  async update(id: string, updateTableSchemaDto: UpdateTableSchemaDto, workspaceId: string): Promise<TableSchema> {
    const table = await this.findOne(id, workspaceId);
    Object.assign(table, updateTableSchemaDto);
    return this.tableSchemaRepository.save(table);
  }

  async remove(id: string, workspaceId: string): Promise<void> {
    const table = await this.findOne(id, workspaceId);
    await this.tableSchemaRepository.remove(table);
  }
}