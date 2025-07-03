import { Injectable, NotFoundException } from '@nestjs/common';
import { getRepository } from '../../dbconfig';
import { FieldSchema } from '../../entities/field-schema.entity';
import { CreateFieldSchemaDto } from './dto/create-field-schema.dto';
import { UpdateFieldSchemaDto } from './dto/update-field-schema.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';

@Injectable()
export class FieldSchemaService {
  async create(createFieldSchemaDto: CreateFieldSchemaDto): Promise<FieldSchema> {
    const fieldSchemaRepository = getRepository(FieldSchema);
    const fieldSchema = fieldSchemaRepository.create(createFieldSchemaDto);
    return fieldSchemaRepository.save(fieldSchema);
  }

  async findAll(tableId: string, paginationDto: PaginationDto) {
    const { page, limit, search, sortBy, sortOrder } = paginationDto;
    const skip = (page - 1) * limit;

    const fieldSchemaRepository = getRepository(FieldSchema);
    const queryBuilder = fieldSchemaRepository
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
    const fieldSchemaRepository = getRepository(FieldSchema);
    const field = await fieldSchemaRepository.findOne({
      where: { id, tableId },
    });

    if (!field) {
      throw new NotFoundException('Field not found');
    }

    return field;
  }

  async update(id: string, updateFieldSchemaDto: UpdateFieldSchemaDto, tableId: string): Promise<FieldSchema> {
    const fieldSchemaRepository = getRepository(FieldSchema);
    const field = await this.findOne(id, tableId);
    Object.assign(field, updateFieldSchemaDto);
    return fieldSchemaRepository.save(field);
  }

  async remove(id: string, tableId: string): Promise<void> {
    const fieldSchemaRepository = getRepository(FieldSchema);
    const field = await this.findOne(id, tableId);
    await fieldSchemaRepository.remove(field);
  }

  async reorderFields(tableId: string, fieldOrders: { id: string; order: number }[]): Promise<void> {
    const fieldSchemaRepository = getRepository(FieldSchema);
    for (const { id, order } of fieldOrders) {
      await fieldSchemaRepository.update({ id, tableId }, { order });
    }
  }
}