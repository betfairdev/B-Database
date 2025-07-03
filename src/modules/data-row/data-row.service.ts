import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DataRow } from '../../entities/data-row.entity';
import { DataHistory } from '../../entities/data-history.entity';
import { User } from '../../entities/user.entity';
import { CreateDataRowDto } from './dto/create-data-row.dto';
import { UpdateDataRowDto } from './dto/update-data-row.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';

@Injectable()
export class DataRowService {
  constructor(
    @InjectRepository(DataRow)
    private dataRowRepository: Repository<DataRow>,
    @InjectRepository(DataHistory)
    private dataHistoryRepository: Repository<DataHistory>,
  ) {}

  async create(createDataRowDto: CreateDataRowDto, user: User): Promise<DataRow> {
    const dataRow = this.dataRowRepository.create({
      ...createDataRowDto,
      ownerId: user.id,
      versionVector: { [user.id]: 1 },
    });

    const savedDataRow = await this.dataRowRepository.save(dataRow);
    await this.createHistoryEntry(savedDataRow);
    return savedDataRow;
  }

  async findAll(tableId: string, paginationDto: PaginationDto) {
    const { page, limit, search, sortBy, sortOrder } = paginationDto;
    const skip = (page - 1) * limit;

    const queryBuilder = this.dataRowRepository
      .createQueryBuilder('dataRow')
      .where('dataRow.tableId = :tableId', { tableId })
      .andWhere('dataRow.deletedAt IS NULL');

    if (search) {
      queryBuilder.andWhere(
        'dataRow.payload::text ILIKE :search',
        { search: `%${search}%` },
      );
    }

    if (sortBy) {
      queryBuilder.orderBy(`dataRow.${sortBy}`, sortOrder);
    } else {
      queryBuilder.orderBy('dataRow.createdAt', sortOrder);
    }

    const [dataRows, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return {
      data: dataRows,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page < Math.ceil(total / limit),
      hasPrevPage: page > 1,
    };
  }

  async findOne(id: string, tableId: string): Promise<DataRow> {
    const dataRow = await this.dataRowRepository.findOne({
      where: { id, tableId, deletedAt: null },
    });

    if (!dataRow) {
      throw new NotFoundException('Data row not found');
    }

    return dataRow;
  }

  async update(id: string, updateDataRowDto: UpdateDataRowDto, tableId: string, user: User): Promise<DataRow> {
    const dataRow = await this.findOne(id, tableId);
    
    // Update version vector
    const currentVersion = dataRow.versionVector?.[user.id] || 0;
    dataRow.versionVector = {
      ...dataRow.versionVector,
      [user.id]: currentVersion + 1,
    };

    Object.assign(dataRow, updateDataRowDto);
    const savedDataRow = await this.dataRowRepository.save(dataRow);
    await this.createHistoryEntry(savedDataRow);
    return savedDataRow;
  }

  async softDelete(id: string, tableId: string): Promise<void> {
    const dataRow = await this.findOne(id, tableId);
    await this.dataRowRepository.softDelete(id);
  }

  async hardDelete(id: string, tableId: string): Promise<void> {
    const dataRow = await this.dataRowRepository.findOne({
      where: { id, tableId },
      withDeleted: true,
    });

    if (!dataRow) {
      throw new NotFoundException('Data row not found');
    }

    // Delete history entries
    await this.dataHistoryRepository.delete({ dataRowId: id });
    
    // Delete the data row
    await this.dataRowRepository.delete(id);
  }

  async restore(id: string, tableId: string): Promise<DataRow> {
    const dataRow = await this.dataRowRepository.findOne({
      where: { id, tableId },
      withDeleted: true,
    });

    if (!dataRow) {
      throw new NotFoundException('Data row not found');
    }

    await this.dataRowRepository.restore(id);
    return this.findOne(id, tableId);
  }

  async getHistory(id: string, tableId: string): Promise<DataHistory[]> {
    await this.findOne(id, tableId);
    
    return this.dataHistoryRepository.find({
      where: { dataRowId: id },
      order: { createdAt: 'DESC' },
      take: 10,
    });
  }

  private async createHistoryEntry(dataRow: DataRow): Promise<void> {
    const historyEntry = this.dataHistoryRepository.create({
      dataRowId: dataRow.id,
      payload: dataRow.payload,
      versionVector: dataRow.versionVector,
    });

    await this.dataHistoryRepository.save(historyEntry);

    // Keep only last 10 versions
    const historyCount = await this.dataHistoryRepository.count({
      where: { dataRowId: dataRow.id },
    });

    if (historyCount > 10) {
      const oldestEntries = await this.dataHistoryRepository.find({
        where: { dataRowId: dataRow.id },
        order: { createdAt: 'ASC' },
        take: historyCount - 10,
      });

      await this.dataHistoryRepository.remove(oldestEntries);
    }
  }
}