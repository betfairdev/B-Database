import { Injectable, NotFoundException } from '@nestjs/common';
import { getRepository } from '../../dbconfig';
import { Relationship } from '../../entities/relationship.entity';
import { CreateRelationshipDto } from './dto/create-relationship.dto';
import { UpdateRelationshipDto } from './dto/update-relationship.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';

@Injectable()
export class RelationshipService {
  async create(createRelationshipDto: CreateRelationshipDto): Promise<Relationship> {
    const relationshipRepository = getRepository(Relationship);
    const relationship = relationshipRepository.create(createRelationshipDto);
    return relationshipRepository.save(relationship);
  }

  async findAll(workspaceId: string, paginationDto: PaginationDto) {
    const { page, limit, sortBy, sortOrder } = paginationDto;
    const skip = (page - 1) * limit;

    const relationshipRepository = getRepository(Relationship);
    const queryBuilder = relationshipRepository
      .createQueryBuilder('relationship')
      .leftJoinAndSelect('relationship.sourceTable', 'sourceTable')
      .leftJoinAndSelect('relationship.sourceField', 'sourceField')
      .leftJoinAndSelect('relationship.destinationTable', 'destinationTable')
      .where('sourceTable.workspaceId = :workspaceId', { workspaceId });

    if (sortBy) {
      queryBuilder.orderBy(`relationship.${sortBy}`, sortOrder);
    } else {
      queryBuilder.orderBy('relationship.createdAt', sortOrder);
    }

    const [relationships, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return {
      data: relationships,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page < Math.ceil(total / limit),
      hasPrevPage: page > 1,
    };
  }

  async findOne(id: string): Promise<Relationship> {
    const relationshipRepository = getRepository(Relationship);
    const relationship = await relationshipRepository.findOne({
      where: { id },
      relations: ['sourceTable', 'sourceField', 'destinationTable'],
    });

    if (!relationship) {
      throw new NotFoundException('Relationship not found');
    }

    return relationship;
  }

  async update(id: string, updateRelationshipDto: UpdateRelationshipDto): Promise<Relationship> {
    const relationshipRepository = getRepository(Relationship);
    const relationship = await this.findOne(id);
    Object.assign(relationship, updateRelationshipDto);
    return relationshipRepository.save(relationship);
  }

  async remove(id: string): Promise<void> {
    const relationshipRepository = getRepository(Relationship);
    const relationship = await this.findOne(id);
    await relationshipRepository.remove(relationship);
  }
}