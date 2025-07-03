import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FieldSchema } from '../../entities/field-schema.entity';
import { CreateFieldSchemaDto } from './dto/create-field-schema.dto';
import { UpdateFieldSchemaDto } from './dto/update-field-schema.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';

@Injectable()
export class FieldSchemaService {
  constructor(
    @InjectRepository(FieldSchema)
    private fieldSchemaRepository: Repository<FieldSchema>,
  ) {}

  async create(createFieldSchemaDto: CreateFieldSchemaDto): Promise<FieldSchema> {
    const fieldSchema = this.fieldSchemaRepository.create(createFieldSchemaDto);
    return this.fieldSchemaRepository.save(fieldSchema);
  }

  async findAll(tableId: string, paginationDto: PaginationDto) {
    const { page, limit, search, sortBy, sortOrder } = paginationDto;
    const skip = (page - 1) * limit;

    const queryBuilder = this.fieldSchemaRepository
      .createQueryBuilder('field')
      .where('field.tableId = :tableId', { tableId });

    if (search) {
      queryBuilder.andWhere(
        '(field.name ILIKE :search OR field.displayName ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (sortBy && sortBy !== 'order') {
      queryBuilder.orderBy(`field.${sortBy}`, sortOrder);
    } else {
      queryBuilder.orderBy('field.order', 'ASC');
    }

    const [fields, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return {
      data: fields,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page < Math.ceil(total / limit),
      hasPrevPage: page > 1,
    };
  }

  async findOne(id: string, tableId: string): Promise<FieldSchema> {
    const field = await this.fieldSchemaRepository.findOne({
      where: { id, tableId },
    });

    if (!field) {
      throw new NotFoundException('Field not found');
    }

    return field;
  }

  async update(id: string, updateFieldSchemaDto: UpdateFieldSchemaDto, tableId: string): Promise<FieldSchema> {
    const field = await this.findOne(id, tableId);
    Object.assign(field, updateFieldSchemaDto);
    return this.fieldSchemaRepository.save(field);
  }

  async remove(id: string, tableId: string): Promise<void> {
    const field = await this.findOne(id, tableId);
    await this.fieldSchemaRepository.remove(field);
  }

  async reorderFields(tableId: string, fieldOrders: { id: string; order: number }[]): Promise<void> {
    for (const { id, order } of fieldOrders) {
      await this.fieldSchemaRepository.update({ id, tableId }, { order });
    }
  }
}