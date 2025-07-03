import { IsUUID, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { RelationshipType } from '../../../common/enums/relationship-type.enum';

export class CreateRelationshipDto {
  @ApiProperty()
  @IsUUID()
  sourceTableId: string;

  @ApiProperty()
  @IsUUID()
  sourceFieldId: string;

  @ApiProperty()
  @IsUUID()
  destinationTableId: string;

  @ApiProperty({ enum: RelationshipType })
  @IsEnum(RelationshipType)
  type: RelationshipType;
}