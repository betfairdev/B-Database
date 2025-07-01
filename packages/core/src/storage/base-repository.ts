import { Repository, FindOptionsWhere, DeepPartial } from 'typeorm';
import { IQueryBuilder, IRepository } from './interfaces.js';
import { BaseEntity } from '../entities/base.entity.js';

/**
 * Base repository implementation with common operations
 */
export abstract class BaseRepository<T extends BaseEntity> implements IRepository<T> {
  constructor(protected repository: Repository<T>) {}

  async findById(id: string): Promise<T | null> {
    return this.repository.findOne({
      where: { id } as FindOptionsWhere<T>,
    });
  }

  async find(criteria?: Partial<T>): Promise<T[]> {
    if (!criteria) {
      return this.repository.find();
    }
    return this.repository.find({
      where: criteria as FindOptionsWhere<T>,
    });
  }

  async findOne(criteria: Partial<T>): Promise<T | null> {
    return this.repository.findOne({
      where: criteria as FindOptionsWhere<T>,
    });
  }

  async create(data: Partial<T>): Promise<T> {
    const entity = this.repository.create(data as DeepPartial<T>);
    return this.repository.save(entity);
  }

  async update(id: string, data: Partial<T>): Promise<T> {
    await this.repository.update(id, data as any);
    const entity = await this.findById(id);
    if (!entity) {
      throw new Error(`Entity with id ${id} not found`);
    }
    return entity;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.repository.delete(id);
    return (result.affected ?? 0) > 0;
  }

  async count(criteria?: Partial<T>): Promise<number> {
    if (!criteria) {
      return this.repository.count();
    }
    return this.repository.count({
      where: criteria as FindOptionsWhere<T>,
    });
  }

  async exists(criteria: Partial<T>): Promise<boolean> {
    const count = await this.repository.count({
      where: criteria as FindOptionsWhere<T>,
    });
    return count > 0;
  }

  query(): IQueryBuilder<T> {
    return new TypeOrmQueryBuilder(this.repository.createQueryBuilder());
  }

  async bulkInsert(entities: Partial<T>[]): Promise<T[]> {
    const created = entities.map(entity => this.repository.create(entity as DeepPartial<T>));
    return this.repository.save(created);
  }

  async bulkUpdate(criteria: Partial<T>, data: Partial<T>): Promise<number> {
    const result = await this.repository.update(criteria as FindOptionsWhere<T>, data as any);
    return result.affected ?? 0;
  }

  async bulkDelete(criteria: Partial<T>): Promise<number> {
    const result = await this.repository.delete(criteria as FindOptionsWhere<T>);
    return result.affected ?? 0;
  }
}

/**
 * TypeORM query builder wrapper
 */
class TypeOrmQueryBuilder<T> implements IQueryBuilder<T> {
  constructor(private queryBuilder: any) {}

  where(field: string, operator: string, value: any): IQueryBuilder<T> {
    this.queryBuilder.where(`${field} ${this.getOperatorSql(operator)} :value`, { value });
    return this;
  }

  andWhere(field: string, operator: string, value: any): IQueryBuilder<T> {
    this.queryBuilder.andWhere(`${field} ${this.getOperatorSql(operator)} :value`, { value });
    return this;
  }

  orWhere(field: string, operator: string, value: any): IQueryBuilder<T> {
    this.queryBuilder.orWhere(`${field} ${this.getOperatorSql(operator)} :value`, { value });
    return this;
  }

  orderBy(field: string, direction: 'ASC' | 'DESC' = 'ASC'): IQueryBuilder<T> {
    this.queryBuilder.orderBy(field, direction);
    return this;
  }

  limit(count: number): IQueryBuilder<T> {
    this.queryBuilder.limit(count);
    return this;
  }

  offset(count: number): IQueryBuilder<T> {
    this.queryBuilder.offset(count);
    return this;
  }

  async execute(): Promise<T[]> {
    return this.queryBuilder.getMany();
  }

  async first(): Promise<T | null> {
    return this.queryBuilder.getOne();
  }

  async count(): Promise<number> {
    return this.queryBuilder.getCount();
  }

  private getOperatorSql(operator: string): string {
    switch (operator) {
      case 'eq':
        return '=';
      case 'ne':
        return '!=';
      case 'gt':
        return '>';
      case 'gte':
        return '>=';
      case 'lt':
        return '<';
      case 'lte':
        return '<=';
      case 'like':
        return 'LIKE';
      case 'ilike':
        return 'ILIKE';
      case 'in':
        return 'IN';
      case 'nin':
        return 'NOT IN';
      default:
        throw new Error(`Unsupported operator: ${operator}`);
    }
  }
}