export class NamingStrategy {
  static tableName(name: string): string {
    return name.toLowerCase().replace(/[^a-z0-9]/g, '_');
  }

  static columnName(name: string): string {
    return name.toLowerCase().replace(/[^a-z0-9]/g, '_');
  }

  static relationName(sourceTable: string, targetTable: string, type: string): string {
    return `${sourceTable}_${targetTable}_${type}`.toLowerCase();
  }

  static indexName(table: string, columns: string[]): string {
    return `idx_${table}_${columns.join('_')}`.toLowerCase();
  }

  static constraintName(table: string, type: string, columns: string[]): string {
    return `${type}_${table}_${columns.join('_')}`.toLowerCase();
  }
}