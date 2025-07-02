import { EntitySchema } from 'typeorm';
import { TableMeta } from '../entity/TableMeta';
import { RelationshipMeta, RelationshipType } from '../entity/RelationshipMeta';
import { FieldTypeRegistry } from '../services/FieldTypeRegistry';

export class DynamicEntityGenerator {
  constructor(private fieldRegistry: FieldTypeRegistry) {}

  generateEntity(table: TableMeta): EntitySchema {
    const columns: Record<string, any> = {
      id: {
        type: 'uuid',
        primary: true,
        generated: 'uuid'
      },
      createdAt: {
        type: 'timestamp',
        createDate: true
      },
      updatedAt: {
        type: 'timestamp',
        updateDate: true
      },
      deletedAt: {
        type: 'timestamp',
        deleteDate: true,
        nullable: true
      }
    };

    const relations: Record<string, any> = {};

    // Add custom fields
    for (const field of table.fields || []) {
      const fieldType = this.fieldRegistry.get(field.type);
      if (!fieldType) {
        console.warn(`Unknown field type: ${field.type}`);
        continue;
      }

      // Skip relationship fields as they'll be handled separately
      if (field.options?.isRelationship) {
        continue;
      }

      columns[field.identifier] = this.mapFieldToColumn(field, fieldType);
    }

    // Add relationships
    for (const relationship of table.sourceRelationships || []) {
      this.addRelationshipToEntity(relationship, relations, columns, 'source');
    }

    for (const relationship of table.targetRelationships || []) {
      this.addRelationshipToEntity(relationship, relations, columns, 'target');
    }

    return new EntitySchema({
      name: table.identifier,
      tableName: table.identifier,
      columns,
      relations,
      indices: table.indexes?.map(index => ({
        name: index.name,
        columns: index.fields,
        unique: index.unique
      })) || []
    });
  }

  private addRelationshipToEntity(
    relationship: RelationshipMeta,
    relations: Record<string, any>,
    columns: Record<string, any>,
    side: 'source' | 'target'
  ): void {
    const isSource = side === 'source';
    const targetTable = isSource ? relationship.targetTable : relationship.sourceTable;
    const relationName = isSource ? relationship.targetField : relationship.sourceField;

    switch (relationship.type) {
      case RelationshipType.ONE_TO_MANY:
        if (isSource) {
          // One side - has many
          relations[relationName] = {
            type: 'one-to-many',
            target: targetTable?.identifier,
            inverseSide: relationship.sourceField
          };
        } else {
          // Many side - belongs to one
          relations[relationName] = {
            type: 'many-to-one',
            target: targetTable?.identifier,
            joinColumn: { name: `${relationship.sourceField}_id` }
          };
          
          // Add foreign key column
          columns[`${relationship.sourceField}_id`] = {
            type: 'uuid',
            nullable: true
          };
        }
        break;

      case RelationshipType.MANY_TO_ONE:
        if (isSource) {
          // Many side - belongs to one
          relations[relationName] = {
            type: 'many-to-one',
            target: targetTable?.identifier,
            joinColumn: { name: `${relationship.targetField}_id` }
          };
          
          // Add foreign key column
          columns[`${relationship.targetField}_id`] = {
            type: 'uuid',
            nullable: true
          };
        } else {
          // One side - has many
          relations[relationName] = {
            type: 'one-to-many',
            target: targetTable?.identifier,
            inverseSide: relationship.targetField
          };
        }
        break;

      case RelationshipType.ONE_TO_ONE:
        relations[relationName] = {
          type: 'one-to-one',
          target: targetTable?.identifier,
          joinColumn: isSource ? { name: `${relationship.targetField}_id` } : undefined,
          inverseSide: isSource ? undefined : relationship.sourceField
        };
        
        if (isSource) {
          columns[`${relationship.targetField}_id`] = {
            type: 'uuid',
            nullable: true,
            unique: true
          };
        }
        break;

      case RelationshipType.MANY_TO_MANY:
        relations[relationName] = {
          type: 'many-to-many',
          target: targetTable?.identifier,
          joinTable: isSource ? {
            name: `${relationship.sourceTable?.identifier}_${relationship.targetTable?.identifier}`,
            joinColumn: { name: `${relationship.sourceTable?.identifier}_id` },
            inverseJoinColumn: { name: `${relationship.targetTable?.identifier}_id` }
          } : undefined,
          inverseSide: isSource ? undefined : relationship.sourceField
        };
        break;
    }
  }

  private mapFieldToColumn(field: any, fieldType: any): any {
    const column: any = {
      nullable: !field.required,
      unique: field.unique || false
    };

    // Map field type to TypeORM column type
    switch (fieldType.name) {
      case 'text':
      case 'textarea':
      case 'email':
      case 'phone':
      case 'url':
      case 'uuid':
      case 'barcode':
      case 'qrcode':
      case 'color':
        column.type = 'varchar';
        column.length = field.options?.maxLength || 255;
        break;

      case 'number':
      case 'rating':
        column.type = field.options?.precision ? 'decimal' : 'integer';
        if (field.options?.precision) {
          column.precision = field.options.precision;
          column.scale = field.options.scale || 2;
        }
        break;

      case 'boolean':
        column.type = 'boolean';
        break;

      case 'date':
        column.type = 'date';
        break;

      case 'datetime':
        column.type = 'timestamp';
        break;

      case 'json':
      case 'multiselect':
        column.type = 'simple-json';
        break;

      case 'richtext':
        column.type = 'text';
        break;

      case 'file':
      case 'image':
        column.type = 'uuid';
        break;

      case 'geography':
        column.type = 'simple-json';
        break;

      case 'dropdown':
      case 'lookup':
        column.type = 'varchar';
        column.length = 255;
        break;

      case 'formula':
        column.type = 'text';
        break;

      default:
        column.type = 'text';
    }

    // Set default value if provided
    if (field.defaultValue !== undefined && field.defaultValue !== null) {
      column.default = field.defaultValue;
    }

    return column;
  }
}